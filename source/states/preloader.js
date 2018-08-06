import {
    IMAGES
} from '../constants/files';

export const key = 'PRELOADER';

export const loader = {
    path: ''
};

export function preload () {
    this.cameras.main
        .setBackgroundColor(0x000000);

    this.progressBar = this.add.graphics();

    this.load.image(IMAGES);

    this.load.on('progress', value => {
        this.progressBar
            .clear()
            .fillStyle(0x71f5a7, 1)
            .fillRect(0, (this.cameras.main.height / 2) - 2, this.cameras.main.width * value, 4)
    });
}

export function create () {
    this.scene.start('LEVEL');
}
