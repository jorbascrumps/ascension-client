requirejs.config({
    baseUrl: 'script/lib/',
    paths: {
        app: '../app',
        phaser: 'phaser/phaser',
        isometric: 'phaser/isometric',
        smokesignals: 'smokesignals/smokesignals',
        state: '../app/state',
        component: '../app/component'
    },
    shim: {
        'phaser': {
            exports: 'Phaser'
        },
        'smokesignals': {
            exports: 'smokesignals'
        },
        'isometric': {
            deps: ['phaser'],
            exports: 'Phaser.Plugin.Isometric'
        }
    }
});
