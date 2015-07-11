requirejs.config({
    baseUrl: 'script/lib/',
    paths: {
        app: '../app',
        phaser: 'phaser/phaser',
        isometric: 'phaser/isometric'
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
