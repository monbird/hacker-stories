// function App2() {
//     return <div>My name is Milo. I'm fluffy Jack Russel Terierr.</div>;
// }

// export default App2;

import React from 'react';

// const initialStories = [
//     {
//         title: 'React',
//         url: 'https://reactjs.org/',
//         author: 'Jordan Walke',
//         num_comments: 3,
//         points: 4,
//         objectID: 0,
//     },
//     {
//         title: 'Redux',
//         url: 'https://redux.js.org/',
//         author: 'Dan Abramov, Andrew Clark',
//         num_comments: 2,
//         points: 5,
//         objectID: 1,
//     },
// ];

// const getAsyncStories = () =>
//     new Promise((resolve) =>
//         setTimeout(() => resolve({ data: { stories: initialStories } }), 3000)
//     );

const useSemiPersistentState = (key, initialState) => {
    const [value, setValue] = React.useState(
        localStorage.getItem(key) || initialState
    );

    React.useEffect(() => {
        localStorage.setItem(key, value);
    }, [value, key]);

    return [value, setValue];

    // const [searchTerm, setSearchTerm] = React.useState(
    //     localStorage.getItem('search') || ''
    // );

    // React.useEffect(() => {
    //     localStorage.setItem('search', searchTerm);
    // }, [searchTerm]);

    // return [searchTerm, setSearchTerm];
};

const storiesReducer = (state, action) => {
    switch (action.type) {
        case 'STORIES_FETCH_INIT':
            return {
                ...state,
                isLoading: true,
                isError: false,
            };
        case 'STORIES_FETCH_SUCCESS':
            return {
                ...state,
                isLoading: false,
                isError: false,
                data: action.payload,
            };
        case 'STORIES_FETCH_FAILURE':
            return {
                ...state,
                isLoading: false,
                isError: true,
            };
        case 'REMOVE_STORY':
            return {
                ...state,
                data: state.data.filter(
                    (story) => action.payload.objectID !== story.objectID
                ),
            };
        default:
            throw new Error();
    }
};

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

const App = () => {
    const [searchTerm, setSearchTerm] = useSemiPersistentState(
        'search',
        'React'
    );

    const [stories, dispatchStories] = React.useReducer(storiesReducer, {
        data: [],
        isLoading: false,
        isError: false,
    });
    // const [stories, setStories] = React.useState([]);
    // const [isLoading, setIsLoading] = React.useState(false);
    // const [isError, setIsError] = React.useState(false);

    React.useEffect(() => {
        if (!searchTerm) return;

        // setIsLoading(true);
        dispatchStories({
            type: 'STORIES_FETCH_INIT',
        });

        fetch(`${API_ENDPOINT}${searchTerm}`)
            .then((response) => response.json())
            .then((result) => {
                dispatchStories({
                    type: 'STORIES_FETCH_SUCCESS',
                    payload: result.hits,
                });
            })
            .catch(() => dispatchStories({ type: 'STORIES_FETCH_FAILURE' }));

        // getAsyncStories()
        //     .then((result) => {
        //         dispatchStories({
        //             type: 'STORIES_FETCH_SUCCESS',
        //             payload: result.data.stories,
        //         });
        //         // setStories(result.data.stories);
        //         // setIsLoading(false);
        //     })
        //     .catch(() => dispatchStories({ type: 'STORIES_FETCH_FAILURE' }));
    }, [searchTerm]);

    const handleRemoveStory = (item) => {
        dispatchStories({
            type: 'REMOVE_STORY',
            payload: item,
        });
        // const newStories = stories.filter((story) => {
        //     return item.objectID !== story.objectID;
        // });
        // dispatchStories({
        //     type: 'SET_STORIES',
        //     payload: newStories,
        // });

        // setStories(newStories);
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    // const searchedStories = stories.data.filter((story) =>
    //     story.title.toLowerCase().includes(searchTerm.toLowerCase())
    // );

    return (
        <div>
            <h1>My Hacker Stories</h1>
            <InputWithLabel
                id="search"
                value={searchTerm}
                isFocused
                onInputChange={handleSearch}
            >
                <strong>Search: </strong>
            </InputWithLabel>
            <hr />

            {stories.isError && <p>Something went wrong...</p>}

            {stories.isLoading ? (
                <p>Loading...</p>
            ) : (
                <List list={stories.data} onRemoveItem={handleRemoveStory} />
            )}
        </div>
    );
};

const InputWithLabel = ({
    id,
    value,
    type = 'text',
    onInputChange,
    isFocused,
    children,
}) => {
    const inputRef = React.useRef();

    React.useEffect(() => {
        if (isFocused && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isFocused]);

    return (
        <>
            <label htmlFor={id}>{children}</label>
            &nbsp;
            <input
                ref={inputRef}
                id={id}
                type={type}
                value={value}
                autoFocus={isFocused}
                onChange={onInputChange}
            />
        </>
    );
};

const List = ({ list, onRemoveItem }) =>
    list.map((item) => (
        <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
    ));

const Item = ({ item, onRemoveItem }) => (
    <div>
        <span>
            <a href={item.url}>{item.title}</a>
        </span>
        <span>{item.author}</span>
        <span>{item.num_comments}</span>
        <span>{item.points}</span>
        <span>
            <button type="button" onClick={() => onRemoveItem(item)}>
                Dismiss
            </button>
        </span>
    </div>
);

export default App;

// -------------------------------------------------------------------------------
// filter method example
// const result = list.filter((item) => item.points == 5);
// console.log('result: ', result);

// reduce method example
// const result2 = list.reduce((prev, next) => prev.points + next.points);
// console.log('result2: ', result2);
// -------------------------------------------------------------------------------
// // Only re-run the effect if searchTerm changes
// React.useEffect(() => {
//     localStorage.setItem('search', searchTerm);
// }, [searchTerm]);

// // Only run the effect once, when the component renders for the first time
// React.useEffect(() => {
//     localStorage.setItem('search', searchTerm);
// }, []);

// // Re-run the effect on every render (initially & update) of the component
// React.useEffect(() => {
//     localStorage.setItem('search', searchTerm);
// });
// -------------------------------------------------------------------------------
// const reference = React.useRef('1');
// console.log('1?', reference.current);
// reference.current = '2';
// console.log('2?', reference.current);
// -------------------------------------------------------------------------------
