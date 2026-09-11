#!/usr/bin/env node
/**
 * Deletes a Sitecore XM Cloud / SitecoreAI project and all of its environments via the CLI.
 *
 * Flow:
 * 1. Authenticates with `dotnet sitecore cloud login`.
 * 2. Lists projects and prompts for the project to delete.
 * 3. Lists environments (and editing hosts) for that project.
 * 4. Requires confirmation by typing the project name.
 * 5. Deletes resources in two phases:
 *    - Phase 1: all editing hosts
 *    - Phase 2: all authoring environments (non-production, then production)
 * 6. Deletes the project once no environments remain.
 *
 * Requirements:
 * - Sitecore CLI with the XM Cloud plugin installed
 * - Organization permissions to list and delete projects/environments
 *
 * Usage: node scripts/delete-project.js
 */

const { execSync } = require("child_process");
const readline = require("readline");

// ==========================================
// UI Helpers
// ==========================================

const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const GRAY = "\x1b[90m";
const RESET = "\x1b[0m";

function writeHeader() {
  console.log("");
  console.log(
    `${CYAN}====================================================${RESET}`,
  );
  console.log(
    `${CYAN}      Sitecore Cloud Project Cleanup Utility${RESET}`,
  );
  console.log(
    `${CYAN}====================================================${RESET}`,
  );
  console.log("");
}

function exitWithError(message) {
  console.error("");
  console.error(`${RED}ERROR: ${message}${RESET}`);
  console.error("");
  process.exit(1);
}

function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// ==========================================
// CLI Helpers
// ==========================================

/**
 * Runs a shell command and returns stdout/stderr/status without throwing.
 * @param {string} command
 * @param {{ inheritStdio?: boolean }} [options]
 */
function runCommand(command, options = {}) {
  const { inheritStdio = false } = options;

  try {
    if (inheritStdio) {
      execSync(command, {
        encoding: "utf-8",
        stdio: "inherit",
      });
      return { stdout: "", stderr: "", status: 0 };
    }

    const stdout = execSync(command, {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { stdout: stdout || "", stderr: "", status: 0 };
  } catch (err) {
    return {
      stdout: err.stdout || "",
      stderr: err.stderr || "",
      status: typeof err.status === "number" ? err.status : 1,
    };
  }
}

/**
 * Runs a Sitecore CLI command that returns JSON and parses the result into an array.
 * @param {string[]} args Arguments after `dotnet sitecore`
 * @param {string} failureMessage
 * @returns {object[]}
 */
function invokeSitecoreCliJson(args, failureMessage) {
  const command = ["dotnet", "sitecore", ...args]
    .map((part) => (/\s/.test(part) ? `"${part}"` : part))
    .join(" ");

  const result = runCommand(command);
  if (result.status !== 0) {
    const details = `${result.stdout}${result.stderr}`.trim();
    if (!details) {
      exitWithError(failureMessage);
    }
    exitWithError(`${failureMessage}\n${details}`);
  }

  const jsonText = `${result.stdout}${result.stderr}`.trim();
  if (!jsonText) {
    return [];
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    exitWithError(
      `${failureMessage} Unable to parse JSON output.\n${jsonText}`,
    );
  }

  if (parsed == null) {
    return [];
  }

  return Array.isArray(parsed) ? parsed : [parsed];
}

/**
 * Reads the first non-empty property value from an object using candidate names.
 * @param {object | null | undefined} object
 * @param {string[]} propertyNames
 */
function getObjectPropertyValue(object, propertyNames) {
  if (object == null || typeof object !== "object") {
    return null;
  }

  for (const propertyName of propertyNames) {
    if (
      Object.prototype.hasOwnProperty.call(object, propertyName) &&
      object[propertyName] != null &&
      `${object[propertyName]}` !== ""
    ) {
      return object[propertyName];
    }
  }

  return null;
}

// ==========================================
// Environment Classification
// ==========================================

function isEditingHost(environment) {
  if (environment == null) {
    return false;
  }

  // Decoupled EH environments expose nested CM linkage and/or type = eh
  const editingHostDetails = getObjectPropertyValue(environment, [
    "editingHostEnvironmentDetails",
    "EditingHostEnvironmentDetails",
  ]);

  if (editingHostDetails != null) {
    const linkedCmId = getObjectPropertyValue(editingHostDetails, [
      "cmEnvironmentId",
      "CmEnvironmentId",
    ]);

    if (linkedCmId) {
      return true;
    }

    // Present details object is enough to treat it as an editing host
    return true;
  }

  const type = String(
    getObjectPropertyValue(environment, [
      "type",
      "Type",
      "hostKind",
      "HostKind",
      "kind",
      "Kind",
    ]) || "",
  );
  if (/^(eh|editing|editinghost|editing.?host)$/i.test(type)) {
    return true;
  }

  const hostName = String(
    getObjectPropertyValue(environment, ["host", "Host"]) || "",
  );
  if (/(^|[.-])eh([.-]|$)/i.test(hostName)) {
    return true;
  }

  const name = String(
    getObjectPropertyValue(environment, ["name", "Name"]) || "",
  );
  if (/editing\s*host|\beh\b/i.test(name)) {
    return true;
  }

  const topLevelCmId = getObjectPropertyValue(environment, [
    "cmEnvironmentId",
    "CmEnvironmentId",
  ]);
  if (topLevelCmId) {
    return true;
  }

  return false;
}

function isProductionEnvironment(environment) {
  if (environment == null) {
    return false;
  }

  const isProduction = getObjectPropertyValue(environment, [
    "isProduction",
    "IsProduction",
    "production",
    "Production",
  ]);
  if (isProduction != null) {
    return Boolean(isProduction);
  }

  const tenantType = String(
    getObjectPropertyValue(environment, ["tenantType", "TenantType"]) || "",
  );
  if (/^prod/i.test(tenantType)) {
    return true;
  }
  if (/non.?prod/i.test(tenantType)) {
    return false;
  }

  const name = String(
    getObjectPropertyValue(environment, ["name", "Name"]) || "",
  );
  return /^prod(uction)?$/i.test(name);
}

function getEnvironmentDisplayName(environment) {
  return String(
    getObjectPropertyValue(environment, ["name", "Name"]) || "",
  );
}

function getEnvironmentId(environment) {
  return String(getObjectPropertyValue(environment, ["id", "Id"]) || "");
}

function getAuthoringSortKey(environment) {
  // Within authoring: non-production first, production last
  return isProductionEnvironment(environment) ? 1 : 0;
}

function getEnvironmentRoleLabel(environment) {
  if (isEditingHost(environment)) {
    return "EditingHost";
  }

  if (isProductionEnvironment(environment)) {
    return "Authoring (Production)";
  }

  return "Authoring (NonProduction)";
}

function getEnvironmentTypeHint(environment) {
  const type = getObjectPropertyValue(environment, ["type", "Type"]);
  const hostName = getObjectPropertyValue(environment, ["host", "Host"]);
  const details = getObjectPropertyValue(environment, [
    "editingHostEnvironmentDetails",
    "EditingHostEnvironmentDetails",
  ]);

  let linkedCmId = null;
  if (details != null) {
    linkedCmId = getObjectPropertyValue(details, [
      "cmEnvironmentId",
      "CmEnvironmentId",
    ]);
  }

  const parts = [];
  if (type) parts.push(`type=${type}`);
  if (linkedCmId) parts.push(`cmEnvironmentId=${linkedCmId}`);
  if (hostName) parts.push(`host=${hostName}`);

  if (parts.length === 0) {
    return "no type/host metadata";
  }

  return parts.join(", ");
}

/**
 * Deletes an editing host or authoring environment via the Sitecore Cloud CLI.
 * @param {object} environment
 * @param {boolean} asEditingHost
 */
function removeCloudEnvironment(environment, asEditingHost) {
  const environmentId = getEnvironmentId(environment);
  const environmentName = getEnvironmentDisplayName(environment);
  const role = getEnvironmentRoleLabel(environment);

  console.log("");
  console.log(
    `${YELLOW}Deleting [${role}] ${environmentName} (${environmentId})...${RESET}`,
  );

  const command = asEditingHost
    ? `dotnet sitecore cloud editinghost delete --environment-id ${environmentId}`
    : `dotnet sitecore cloud environment delete --environment-id ${environmentId}`;

  const result = runCommand(command, { inheritStdio: true });
  if (result.status !== 0) {
    exitWithError(
      `Failed to delete '${environmentName}' (${environmentId}). Stop any running deployment in Deploy App if needed, then re-run.`,
    );
  }

  console.log(`${GREEN}Deleted: ${environmentName}${RESET}`);
}

function compareByName(a, b) {
  return getEnvironmentDisplayName(a).localeCompare(
    getEnvironmentDisplayName(b),
  );
}

// ==========================================
// Main
// ==========================================

(async () => {
  writeHeader();

  //
  // STEP 1 - Authenticate
  //
  console.log(`${YELLOW}Authenticating with Sitecore Cloud...${RESET}`);
  console.log(`${GRAY}A browser window may open for device login.${RESET}`);
  console.log("");

  const loginResult = runCommand("dotnet sitecore cloud login", {
    inheritStdio: true,
  });
  if (loginResult.status !== 0) {
    exitWithError(
      "Authentication failed. Run 'dotnet sitecore cloud login' manually and try again.",
    );
  }

  console.log(`${GREEN}Authentication succeeded.${RESET}`);
  console.log("");

  //
  // STEP 2 - List projects and select one
  //
  console.log(`${YELLOW}Retrieving projects...${RESET}`);

  const projects = invokeSitecoreCliJson(
    ["cloud", "project", "list", "--json"],
    "Failed to retrieve projects. Make sure the XM Cloud plugin is installed and you are logged in.",
  );

  if (!projects.length) {
    exitWithError("No projects found for the authenticated organization.");
  }

  console.log("");
  console.log("Available Projects");
  console.log("------------------");

  projects.forEach((project, index) => {
    const name = getEnvironmentDisplayName(project);
    const id = getEnvironmentId(project);
    console.log(`[${index + 1}] ${name}  (${id})`);
  });

  console.log("");
  const selection = (
    await ask("Enter the project number or project ID to delete: ")
  ).trim();

  if (!selection) {
    exitWithError("No project selected.");
  }

  let selectedProject = null;

  if (/^\d+$/.test(selection)) {
    const index = Number.parseInt(selection, 10) - 1;
    if (index < 0 || index >= projects.length) {
      exitWithError("Invalid project number.");
    }
    selectedProject = projects[index];
  } else {
    selectedProject =
      projects.find(
        (project) =>
          getEnvironmentId(project) === selection ||
          getEnvironmentDisplayName(project) === selection,
      ) || null;
  }

  if (!selectedProject) {
    exitWithError(`Could not find a project matching '${selection}'.`);
  }

  const projectId = getEnvironmentId(selectedProject);
  const projectName = getEnvironmentDisplayName(selectedProject);

  console.log("");
  console.log(
    `${CYAN}Selected project: ${projectName} (${projectId})${RESET}`,
  );
  console.log("");

  //
  // STEP 3 - List environments for the project
  //
  console.log(`${YELLOW}Retrieving environments for project...${RESET}`);

  const environments = invokeSitecoreCliJson(
    ["cloud", "environment", "list", "--project-id", projectId, "--json"],
    `Failed to retrieve environments for project '${projectName}'.`,
  );

  const editingHosts = environments
    .filter((environment) => isEditingHost(environment))
    .sort(compareByName);

  const authoringEnvironments = environments
    .filter((environment) => !isEditingHost(environment))
    .sort((a, b) => {
      const sortDiff = getAuthoringSortKey(a) - getAuthoringSortKey(b);
      if (sortDiff !== 0) {
        return sortDiff;
      }
      return compareByName(a, b);
    });

  console.log("");
  console.log(
    `${GRAY}Found ${environments.length} environment(s) total.${RESET}`,
  );

  if (editingHosts.length === 0 && authoringEnvironments.length === 0) {
    console.log(
      `${YELLOW}No environments found for this project.${RESET}`,
    );
  } else {
    console.log("Deletion order");
    console.log("--------------");
    console.log("1) Editing hosts (deleted first)");

    if (editingHosts.length === 0) {
      console.log(
        `${YELLOW}   (none detected - check type metadata below if Deploy App shows editing hosts)${RESET}`,
      );
      for (const environment of environments) {
        const displayName = getEnvironmentDisplayName(environment);
        const environmentId = getEnvironmentId(environment);
        const typeHint = getEnvironmentTypeHint(environment);
        console.log(
          `${GRAY}   - unknown: ${displayName} (${environmentId}) [${typeHint}]${RESET}`,
        );
      }
    } else {
      for (const environment of editingHosts) {
        const displayName = getEnvironmentDisplayName(environment);
        const environmentId = getEnvironmentId(environment);
        const typeHint = getEnvironmentTypeHint(environment);
        console.log(
          `   - ${displayName}  (${environmentId}) [${typeHint}]`,
        );
      }
    }

    console.log("2) Authoring environments (deleted after editing hosts)");
    if (authoringEnvironments.length === 0) {
      console.log("   (none)");
    } else {
      for (const environment of authoringEnvironments) {
        const role = getEnvironmentRoleLabel(environment);
        const displayName = getEnvironmentDisplayName(environment);
        const environmentId = getEnvironmentId(environment);
        const typeHint = getEnvironmentTypeHint(environment);
        console.log(
          `   - [${role}] ${displayName}  (${environmentId}) [${typeHint}]`,
        );
      }
    }
  }

  console.log("");
  console.log(
    `${RED}WARNING: This permanently deletes the project and all listed environments.${RESET}`,
  );
  console.log("");

  const confirmation = await ask(
    `Type the project name '${projectName}' to confirm deletion: `,
  );
  if (confirmation !== projectName) {
    exitWithError(
      "Confirmation did not match. Aborting without deleting anything.",
    );
  }

  //
  // STEP 4 - Delete editing hosts, then authoring environments
  //
  console.log("");
  console.log(`${YELLOW}Phase 1: Deleting editing hosts...${RESET}`);

  if (editingHosts.length === 0) {
    console.log(`${GRAY}No editing hosts to delete.${RESET}`);
  } else {
    for (const environment of editingHosts) {
      removeCloudEnvironment(environment, true);
    }
  }

  console.log("");
  console.log(`${YELLOW}Phase 2: Deleting authoring environments...${RESET}`);

  if (authoringEnvironments.length === 0) {
    console.log(`${GRAY}No authoring environments to delete.${RESET}`);
  } else {
    for (const environment of authoringEnvironments) {
      removeCloudEnvironment(environment, false);
    }
  }

  //
  // STEP 5 - Delete the project
  //
  console.log("");
  console.log(
    `${YELLOW}Deleting project '${projectName}' (${projectId})...${RESET}`,
  );

  const deleteProjectResult = runCommand(
    `dotnet sitecore cloud project delete --project-id ${projectId}`,
    { inheritStdio: true },
  );
  if (deleteProjectResult.status !== 0) {
    exitWithError(
      `Environments were deleted, but project deletion failed. Delete the project manually with:\n  dotnet sitecore cloud project delete --project-id ${projectId}`,
    );
  }

  console.log("");
  console.log(
    `${GREEN}====================================================${RESET}`,
  );
  console.log(
    `${GREEN} Project '${projectName}' was deleted successfully.${RESET}`,
  );
  console.log(
    `${GREEN}====================================================${RESET}`,
  );
  console.log("");
})().catch((error) => {
  exitWithError(error?.message || String(error));
});
