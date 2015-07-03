requirejs.config({
    baseUrl: 'script/lib/',
    paths: {
        app: '../app',
        phaser: 'phaser/phaser'
    },
    shim: {
        'phaser': {
            exports: 'Phaser'
        }
    }
});
