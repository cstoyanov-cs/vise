module.exports = function babel(api) {
    const isTest = api.cache(() => process.env.NODE_ENV === 'test' || process.env.BABEL_ENV === 'test');
    return {
        presets: [
            ['@babel/preset-env', { targets: { node: 'current' } }],
        ],
        plugins: isTest ? [
            // Inject babel-plugin-istanbul ourselves so we can override cwd
            // (the default excludes files outside Jest's cwd, which excludes
            // ../../vise/data/js/hints.js when running from tests/js/).
            ['istanbul', { cwd: '/home/opencode/DEV/vise/.worktrees/vise-dev', exclude: [] }],
        ] : [],
    };
};
