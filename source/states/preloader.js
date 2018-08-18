import {
    IMAGES
} from '../constants/files';

export const key = 'PRELOADER';

export const loader = {
    path: ''
};

export function preload () {
    this.letterbox = this.add.graphics();
    this.progressBar = this.add.graphics();
    this.versionNum = this.make.text({
        style: {
            fill: '#ffffff'
        },
        text: 'Pre-alpha v0.1.0',
        x: this.cameras.main.width - 10,
        y: this.cameras.main.height - 10
    })
        .setOrigin(1, 1);
    this.loadedAsset = this.make.text({
        style: {
            fill: '#ffffff'
        },
        text: '',
        x: this.versionNum.x,
        y: this.versionNum.y - this.versionNum.displayHeight
    })
        .setOrigin(1, 1);
    transition.call(this, 0);

    this.load.image(IMAGES);

    this.load.on('progress', value => {
        this.progressBar
            .clear()
            .fillStyle(0x71f5a7, 1)
            .fillRect(0, (this.cameras.main.height / 2) - 2, this.cameras.main.width * value, 4)
    });

    this.load.on('fileprogress', asset =>
        this.loadedAsset.setText(asset.src)
    );
}

export function create () {
    this.progressBar.clear();

    this.scene.transition({
        target: 'LEVEL',
        duration: 500,
        moveBelow: true,
        onUpdate: transition.bind(this)
    });
}

function transition (progress) {
    const diff = 1 - progress;
    const screenMiddle = this.cameras.main.height / 2;

    const lineColor = progress > 0 ? 0x71f5a7 : 0xffffff;
    const lineAlpha = progress > 0 ? 1 : 0.1;

    this.letterbox
        .clear()
        .fillStyle(0x000000, 1)
        .lineStyle(2, lineColor, lineAlpha)
        .fillRect(0, -screenMiddle * progress, this.cameras.main.width, this.cameras.main.height / 2)

        .beginPath()
        .moveTo(0, screenMiddle * diff - 1)
        .lineTo(this.cameras.main.width, screenMiddle * diff - 1)
        .closePath()
        .strokePath()

        .fillRect(0, screenMiddle + (screenMiddle * progress), this.cameras.main.width, this.cameras.main.height / 2)

        .beginPath()
        .moveTo(0, screenMiddle + screenMiddle * progress + 1)
        .lineTo(this.cameras.main.width, screenMiddle + screenMiddle * progress + 1)
        .closePath()
        .strokePath()

}
