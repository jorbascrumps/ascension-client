requirejs.config({
    baseUrl: 'script/lib/',
    paths: {
        app: '../app',
        phaser: 'phaser/phaser',
        smokesignals: 'smokesignals/smokesignals',
        io: 'socket.io/socket.io',
        state: '../app/state',
        component: '../app/component',
        ui: '../app/ui'
    },
    shim: {
        'phaser': {
            exports: 'Phaser'
        },
        'smokesignals': {
            exports: 'smokesignals'
        }
    }
});
