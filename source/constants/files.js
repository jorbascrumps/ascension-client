const type = (type, assets) => assets
    .map(asset => ({
        ...asset,
        type
    }));

export const IMAGES = type('image', [
    {
        key: 'background',
        url: '/source/assets/scene/stars.jpg'
    },
    {
        key: 'tiles',
        url: '/core/common/data/maps/level.png'
    },
    {
        key: 'player',
        url: '/source/assets/pawn/skeleton.png'
    },
    {
        key: 'blood',
        url: '/source/assets/blood.png'
    },
]);