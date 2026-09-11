<#
.SYNOPSIS
Deletes a Sitecore XM Cloud / SitecoreAI project and all of its environments via the CLI.

.DESCRIPTION
1. Authenticates with `dotnet sitecore cloud login`.
2. Lists projects and prompts for the project to delete.
3. Lists environments (and editing hosts) for that project.
4. Requires confirmation by typing the project name.
5. Deletes resources in two phases:
   - Phase 1: all editing hosts
   - Phase 2: all authoring environments (non-production, then production)
6. Deletes the project once no environments remain.

.REQUIREMENTS
- Sitecore CLI with the XM Cloud plugin installed
- Organization permissions to list and delete projects/environments
#>

[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

function Write-Header {
    Write-Host ""
    Write-Host "====================================================" -ForegroundColor Cyan
    Write-Host "      Sitecore Cloud Project Cleanup Utility" -ForegroundColor Cyan
    Write-Host "====================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Exit-WithError {
    param([string]$Message)

    Write-Host ""
    Write-Host "ERROR: $Message" -ForegroundColor Red
    Write-Host ""
    exit 1
}

function Invoke-SitecoreCliJson {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Arguments,

        [string]$FailureMessage = "Sitecore CLI command failed."
    )

    $raw = & dotnet sitecore @Arguments 2>&1
    $exitCode = $LASTEXITCODE

    if ($exitCode -ne 0) {
        $details = ($raw | Out-String).Trim()
        if ([string]::IsNullOrWhiteSpace($details)) {
            Exit-WithError $FailureMessage
        }

        Exit-WithError "$FailureMessage`n$details"
    }

    $jsonText = ($raw | Out-String).Trim()
    if ([string]::IsNullOrWhiteSpace($jsonText)) {
        return @()
    }

    try {
        $parsed = $jsonText | ConvertFrom-Json
    }
    catch {
        Exit-WithError "$FailureMessage Unable to parse JSON output.`n$jsonText"
    }

    if ($null -eq $parsed) {
        return @()
    }

    if ($parsed -is [System.Array]) {
        return @($parsed)
    }

    return @($parsed)
}

function Get-ObjectPropertyValue {
    param(
        $Object,
        [string[]]$PropertyNames
    )

    if ($null -eq $Object) {
        return $null
    }

    foreach ($propertyName in $PropertyNames) {
        $match = $Object.PSObject.Properties |
            Where-Object { $_.Name -eq $propertyName } |
            Select-Object -First 1

        if ($match -and $null -ne $match.Value -and "$($match.Value)" -ne "") {
            return $match.Value
        }
    }

    return $null
}

function Test-IsEditingHost {
    param($Environment)

    if ($null -eq $Environment) {
        return $false
    }

    # Decoupled EH environments expose nested CM linkage and/or type = eh
    $editingHostDetails = Get-ObjectPropertyValue -Object $Environment -PropertyNames @(
        "editingHostEnvironmentDetails",
        "EditingHostEnvironmentDetails"
    )

    if ($null -ne $editingHostDetails) {
        $linkedCmId = Get-ObjectPropertyValue -Object $editingHostDetails -PropertyNames @(
            "cmEnvironmentId",
            "CmEnvironmentId"
        )

        if ($linkedCmId) {
            return $true
        }

        # Present details object is enough to treat it as an editing host
        return $true
    }

    $type = [string](Get-ObjectPropertyValue -Object $Environment -PropertyNames @("type", "Type", "hostKind", "HostKind", "kind", "Kind"))
    if ($type -match "(?i)^(eh|editing|editinghost|editing.?host)$") {
        return $true
    }

    $hostName = [string](Get-ObjectPropertyValue -Object $Environment -PropertyNames @("host", "Host"))
    if ($hostName -match "(?i)(^|[.-])eh([.-]|$)") {
        return $true
    }

    $name = [string](Get-ObjectPropertyValue -Object $Environment -PropertyNames @("name", "Name"))
    if ($name -match "(?i)editing\s*host|\beh\b") {
        return $true
    }

    $topLevelCmId = Get-ObjectPropertyValue -Object $Environment -PropertyNames @("cmEnvironmentId", "CmEnvironmentId")
    if ($topLevelCmId) {
        return $true
    }

    return $false
}

function Test-IsProductionEnvironment {
    param($Environment)

    if ($null -eq $Environment) {
        return $false
    }

    $isProduction = Get-ObjectPropertyValue -Object $Environment -PropertyNames @("isProduction", "IsProduction", "production", "Production")
    if ($null -ne $isProduction) {
        return [bool]$isProduction
    }

    $tenantType = [string](Get-ObjectPropertyValue -Object $Environment -PropertyNames @("tenantType", "TenantType"))
    if ($tenantType -match "(?i)^prod") {
        return $true
    }

    if ($tenantType -match "(?i)non.?prod") {
        return $false
    }

    $name = [string](Get-ObjectPropertyValue -Object $Environment -PropertyNames @("name", "Name"))
    return $name -match "(?i)^prod(uction)?$"
}

function Get-EnvironmentDisplayName {
    param($Environment)

    return [string](Get-ObjectPropertyValue -Object $Environment -PropertyNames @("name", "Name"))
}

function Get-EnvironmentId {
    param($Environment)

    return [string](Get-ObjectPropertyValue -Object $Environment -PropertyNames @("id", "Id"))
}

function Get-AuthoringSortKey {
    param($Environment)

    # Within authoring: non-production first, production last
    if (Test-IsProductionEnvironment -Environment $Environment) {
        return 1
    }

    return 0
}

function Get-EnvironmentRoleLabel {
    param($Environment)

    if (Test-IsEditingHost -Environment $Environment) {
        return "EditingHost"
    }

    if (Test-IsProductionEnvironment -Environment $Environment) {
        return "Authoring (Production)"
    }

    return "Authoring (NonProduction)"
}

function Remove-CloudEnvironment {
    param(
        $Environment,
        [switch]$IsEditingHost
    )

    $environmentId = Get-EnvironmentId -Environment $Environment
    $environmentName = Get-EnvironmentDisplayName -Environment $Environment
    $role = Get-EnvironmentRoleLabel -Environment $Environment

    Write-Host ""
    Write-Host "Deleting [$role] $environmentName ($environmentId)..." -ForegroundColor Yellow

    if ($IsEditingHost) {
        & dotnet sitecore cloud editinghost delete --environment-id $environmentId
    }
    else {
        & dotnet sitecore cloud environment delete --environment-id $environmentId
    }

    if ($LASTEXITCODE -ne 0) {
        Exit-WithError "Failed to delete '$environmentName' ($environmentId). Stop any running deployment in Deploy App if needed, then re-run."
    }

    Write-Host "Deleted: $environmentName" -ForegroundColor Green
}

function Get-EnvironmentTypeHint {
    param($Environment)

    $type = Get-ObjectPropertyValue -Object $Environment -PropertyNames @("type", "Type")
    $hostName = Get-ObjectPropertyValue -Object $Environment -PropertyNames @("host", "Host")
    $details = Get-ObjectPropertyValue -Object $Environment -PropertyNames @(
        "editingHostEnvironmentDetails",
        "EditingHostEnvironmentDetails"
    )
    $linkedCmId = $null
    if ($null -ne $details) {
        $linkedCmId = Get-ObjectPropertyValue -Object $details -PropertyNames @("cmEnvironmentId", "CmEnvironmentId")
    }

    $parts = @()
    if ($type) { $parts += "type=$type" }
    if ($linkedCmId) { $parts += "cmEnvironmentId=$linkedCmId" }
    if ($hostName) { $parts += "host=$hostName" }

    if ($parts.Count -eq 0) {
        return "no type/host metadata"
    }

    return ($parts -join ", ")
}

Write-Header

#
# STEP 1 - Authenticate
#
Write-Host "Authenticating with Sitecore Cloud..." -ForegroundColor Yellow
Write-Host "A browser window may open for device login." -ForegroundColor DarkGray
Write-Host ""

& dotnet sitecore cloud login
if ($LASTEXITCODE -ne 0) {
    Exit-WithError "Authentication failed. Run 'dotnet sitecore cloud login' manually and try again."
}

Write-Host "Authentication succeeded." -ForegroundColor Green
Write-Host ""

#
# STEP 2 - List projects and select one
#
Write-Host "Retrieving projects..." -ForegroundColor Yellow

$projects = Invoke-SitecoreCliJson `
    -Arguments @("cloud", "project", "list", "--json") `
    -FailureMessage "Failed to retrieve projects. Make sure the XM Cloud plugin is installed and you are logged in."

if (-not $projects -or $projects.Count -eq 0) {
    Exit-WithError "No projects found for the authenticated organization."
}

Write-Host ""
Write-Host "Available Projects"
Write-Host "------------------"

for ($i = 0; $i -lt $projects.Count; $i++) {
    $project = $projects[$i]
    Write-Host ("[{0}] {1}  ({2})" -f ($i + 1), $project.name, $project.id)
}

Write-Host ""
$selection = Read-Host "Enter the project number or project ID to delete"

if ([string]::IsNullOrWhiteSpace($selection)) {
    Exit-WithError "No project selected."
}

$selectedProject = $null
$trimmedSelection = $selection.Trim()

if ($trimmedSelection -match '^\d+$') {
    $index = [int]$trimmedSelection - 1
    if ($index -lt 0 -or $index -ge $projects.Count) {
        Exit-WithError "Invalid project number."
    }

    $selectedProject = $projects[$index]
}
else {
    $selectedProject = $projects | Where-Object { $_.id -eq $trimmedSelection -or $_.name -eq $trimmedSelection } | Select-Object -First 1
}

if (-not $selectedProject) {
    Exit-WithError "Could not find a project matching '$trimmedSelection'."
}

$projectId = Get-EnvironmentId -Environment $selectedProject
if (-not $projectId) {
    $projectId = [string](Get-ObjectPropertyValue -Object $selectedProject -PropertyNames @("id", "Id"))
}
$projectName = Get-EnvironmentDisplayName -Environment $selectedProject
if (-not $projectName) {
    $projectName = [string](Get-ObjectPropertyValue -Object $selectedProject -PropertyNames @("name", "Name"))
}

Write-Host ""
Write-Host "Selected project: $projectName ($projectId)" -ForegroundColor Cyan
Write-Host ""

#
# STEP 3 - List environments for the project
#
Write-Host "Retrieving environments for project..." -ForegroundColor Yellow

$environments = Invoke-SitecoreCliJson `
    -Arguments @("cloud", "environment", "list", "--project-id", $projectId, "--json") `
    -FailureMessage "Failed to retrieve environments for project '$projectName'."

$editingHosts = @(
    $environments |
        Where-Object { Test-IsEditingHost -Environment $_ } |
        Sort-Object { Get-EnvironmentDisplayName -Environment $_ }
)

$authoringEnvironments = @(
    $environments |
        Where-Object { -not (Test-IsEditingHost -Environment $_) } |
        Sort-Object { Get-AuthoringSortKey -Environment $_ }, { Get-EnvironmentDisplayName -Environment $_ }
)

Write-Host ""
Write-Host ("Found {0} environment(s) total." -f $environments.Count) -ForegroundColor DarkGray

if ($editingHosts.Count -eq 0 -and $authoringEnvironments.Count -eq 0) {
    Write-Host "No environments found for this project." -ForegroundColor DarkYellow
}
else {
    Write-Host "Deletion order"
    Write-Host "--------------"
    Write-Host "1) Editing hosts (deleted first)"
    if ($editingHosts.Count -eq 0) {
        Write-Host "   (none detected - check type metadata below if Deploy App shows editing hosts)" -ForegroundColor DarkYellow
        foreach ($environment in $environments) {
            $displayName = Get-EnvironmentDisplayName -Environment $environment
            $environmentId = Get-EnvironmentId -Environment $environment
            $typeHint = Get-EnvironmentTypeHint -Environment $environment
            Write-Host ("   - unknown: {0} ({1}) [{2}]" -f $displayName, $environmentId, $typeHint) -ForegroundColor DarkGray
        }
    }
    else {
        foreach ($environment in $editingHosts) {
            $displayName = Get-EnvironmentDisplayName -Environment $environment
            $environmentId = Get-EnvironmentId -Environment $environment
            $typeHint = Get-EnvironmentTypeHint -Environment $environment
            Write-Host ("   - {0}  ({1}) [{2}]" -f $displayName, $environmentId, $typeHint)
        }
    }

    Write-Host "2) Authoring environments (deleted after editing hosts)"
    if ($authoringEnvironments.Count -eq 0) {
        Write-Host "   (none)"
    }
    else {
        foreach ($environment in $authoringEnvironments) {
            $role = Get-EnvironmentRoleLabel -Environment $environment
            $displayName = Get-EnvironmentDisplayName -Environment $environment
            $environmentId = Get-EnvironmentId -Environment $environment
            $typeHint = Get-EnvironmentTypeHint -Environment $environment
            Write-Host ("   - [{0}] {1}  ({2}) [{3}]" -f $role, $displayName, $environmentId, $typeHint)
        }
    }
}

Write-Host ""
Write-Host "WARNING: This permanently deletes the project and all listed environments." -ForegroundColor Red
Write-Host ""

$confirmation = Read-Host "Type the project name '$projectName' to confirm deletion"
if ($confirmation -ne $projectName) {
    Exit-WithError "Confirmation did not match. Aborting without deleting anything."
}

#
# STEP 4 - Delete editing hosts, then authoring environments
#
Write-Host ""
Write-Host "Phase 1: Deleting editing hosts..." -ForegroundColor Yellow

if ($editingHosts.Count -eq 0) {
    Write-Host "No editing hosts to delete." -ForegroundColor DarkGray
}
else {
    foreach ($environment in $editingHosts) {
        Remove-CloudEnvironment -Environment $environment -IsEditingHost
    }
}

Write-Host ""
Write-Host "Phase 2: Deleting authoring environments..." -ForegroundColor Yellow

if ($authoringEnvironments.Count -eq 0) {
    Write-Host "No authoring environments to delete." -ForegroundColor DarkGray
}
else {
    foreach ($environment in $authoringEnvironments) {
        Remove-CloudEnvironment -Environment $environment
    }
}

#
# STEP 5 - Delete the project
#
Write-Host ""
Write-Host "Deleting project '$projectName' ($projectId)..." -ForegroundColor Yellow

& dotnet sitecore cloud project delete --project-id $projectId
if ($LASTEXITCODE -ne 0) {
    Exit-WithError "Environments were deleted, but project deletion failed. Delete the project manually with:`n  dotnet sitecore cloud project delete --project-id $projectId"
}

Write-Host ""
Write-Host "====================================================" -ForegroundColor Green
Write-Host " Project '$projectName' was deleted successfully." -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
Write-Host ""
