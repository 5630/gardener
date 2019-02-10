require('dotenv').config();
const gardenerBot = require("./gardener");
(async () => {
    const github_token = process.env.GITHUB_TOKEN;
    const owner = process.env.OWNER;
    const repo = process.env.REPO;
    const app_name = process.env.APP_NAME;
    const gardener = new gardenerBot({
        github_token,
        owner,
        repo,
        app_name
    });

    await gardener.run();
})();