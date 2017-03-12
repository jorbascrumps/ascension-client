import {
    createStore
} from 'redux';

const initialState = {
    pawns: {}
};

export default function () {
    return createStore(
        function (state = initialState, action = {}) {
            const {
                id,
                type,
                ...data
            } = action;

            switch (type) {
                case 'PAWN_REGISTER':
                    return {
                        ...state,
                        pawns: {
                            ...state.pawns,
                            [id]: data
                        }
                    };
                case 'PAWN_MOVE':
                    return {
                        ...state,
                        pawns: {
                            ...state.pawns,
                            [id]: {
                                ...state.pawns[id],
                                ...data
                            }
                        }
                    };
                default:
                    return state;
            }
        },
        window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
    );
}
