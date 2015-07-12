requirejs.config({
    baseUrl: 'script/lib/',
    paths: {
        app: '../app',
        phaser: 'phaser/phaser',
        isometric: 'phaser/isometric',
        component: '../app/component'
    },
    shim: {
        'phaser': {
            exports: 'Phaser'
        },
        'isometric': {
            deps: ['phaser'],
            exports: 'Phaser.Plugin.Isometric'
        }
    }
});
