const debug = require('debug')('gardener');
const _ = require('lodash');
const rp = require('request-promise-native');

class gardener {
    constructor({github_token, owner, repo, app_name, messages}) {
        this.domain = 'https://api.github.com';
        this.owner = owner;
        this.repo = repo;
        this.messages = messages || [
            "🌱🌱🌱🌱🌱🌱🌱🌱🌱🌱🌱🌱🌱🌱🌱🌱🌱🌱🌱🌱🌱🌱🌱🌱🌱🌱🌱🌱🌱",
            "I need to mow the lawn.",
            "What, did I ruin the lawn?",
            "He gets busy picking weeds and tending to the lawn.",
            "Let's meet at the public lawn tomorrow.",
            "After finishing it, I'll start on the lawn.",
            "But if I water the lawn, the grass will grow.",
            "We hired a man to mow the lawn.",
            "The lawn in the front yard is kept very neat.",
            "Did you cut my lawn a few weeks ago?",
            "Do not put off lawn treatment.",
            "Our lawn will be mowed twice a month.",
            "I want my lawn mower back.",
            "I'm trying to do my lawn!",
            "I'm gonna check the lawn again.",
            "The lawn was checkered with sunlight and shade.",
            "The gardener trim the lawn evenly.",
            "Your lawn looks fantastic.",
            "Let me know about your lawns."
        ];
        this.headers = {
            Accept: 'application/vnd.github.v3+json',
            Authorization: `token ${github_token}`,
            'User-Agent': app_name
        }
    }
    async get_master() {
        await rp({
            url: `${this.domain}/repos/${this.owner}/${this.repo}/branches/master`,
            method: 'get',
            headers: this.headers,
            json: true,
            transform: (body) => {
                debug(body);
                this.commit_sha = _.get(body, 'commit.sha');
            }
        })
    }
    async get_tree() {
        await rp({
            url: `${this.domain}/repos/${this.owner}/${this.repo}/git/trees/${this.commit_sha}`,
            method: 'get',
            headers: this.headers,
            json: true,
            transform: (body) => {
                debug(body);
                this.tree = _.get(body, 'tree');
            }
        })
    }
    async create_tree() {
        await rp({
            url: `${this.domain}/repos/${this.owner}/${this.repo}/git/trees`,
            method: 'post',
            headers: this.headers,
            json: {
                "tree": this.tree
            },
            transform: (body) => {
                debug(body);
                this.new_tree_sha = _.get(body, 'sha');
            }
        })
    }
    async create_commit() {
        const response = await rp({
            url: `${this.domain}/repos/${this.owner}/${this.repo}/git/commits`,
            method: 'post',
            headers: this.headers,
            json: {                
                message: _.sample(this.messages),
                tree: this.new_tree_sha
            },
            transform: (body) => {
                debug(body);
                this.new_commit_sha = _.get(body, 'sha');
            }
        })
    }
    async update_reference() {
        const response = await rp({
            url: `${this.domain}/repos/${this.owner}/${this.repo}/git/refs/heads/master`,
            method: 'patch',
            headers: this.headers,
            json: {                
                sha: this.new_commit_sha,
                force: true
            }
        })
        debug(response);
    }
    async run() {
        await this.get_master();
        await this.get_tree();
        await this.create_tree();
        await this.create_commit();
        await this.update_reference();
    }
}

module.exports = gardener;