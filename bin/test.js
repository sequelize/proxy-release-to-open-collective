// curl -XGET -u "username:password" -H "Accept: application/vnd.github.everest-preview+json" -H "Accept: application/vnd.github.everest-preview+json" -H "Content-Type: application/json" https://api.github.com/repos/sequelize/cli/releases

const proxy = require("../src");

const releaseId = "57179570";
const projectSlug = "sequelize/cli";
const ocSlug = "sequelize";
const ocApiKey = "oc_api_key";
const githubToken = "ghp_xyz";

proxy({ releaseId, projectSlug, githubToken, ocSlug, ocApiKey });
