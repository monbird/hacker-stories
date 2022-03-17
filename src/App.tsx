import React from 'react';
import axios from 'axios';
import styles from './App.module.css';
import logo from './logo.svg';
import List from './List';
import SearchForm from './SearchForm';
import LastSearches from './LastSearches';

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

const useSemiPersistentState = (
    key: string,
    initialState: string
): [string, (newValue: string) => void] => {
    const isMounted = React.useRef(false);

    const [value, setValue] = React.useState(
        localStorage.getItem(key) || initialState
    );

    React.useEffect(() => {
        if (!isMounted.current) {
            // a way to prevent calling simple function in else statement for a component when rendering for the first time; useRef Hook keeps its ref.current property intact over re-renders
            isMounted.current = true;
        } else {
            localStorage.setItem(key, value);
        }
    }, [value, key]);

    return [value, setValue];
};

type Story = {
    objectID: string;
    url: string;
    title: string;
    author: string;
    num_comments: number;
    points: number;
};

type Stories = Array<Story>;

type StoriesState = {
    data: Stories;
    isLoading: boolean;
    isError: boolean;
};

interface StoriesFetchInitAction {
    type: 'STORIES_FETCH_INIT';
}

interface StoriesFetchSuccessAction {
    type: 'STORIES_FETCH_SUCCESS';
    payload: Stories;
}

interface StoriesFetchFailureAction {
    type: 'STORIES_FETCH_FAILURE';
}

interface StoriesRemoveAction {
    type: 'REMOVE_STORY';
    payload: Story;
}

type StoriesAction =
    | StoriesFetchInitAction
    | StoriesFetchSuccessAction
    | StoriesFetchFailureAction
    | StoriesRemoveAction;

const storiesReducer = (state: StoriesState, action: StoriesAction) => {
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

const getSumComments = (stories: StoriesState) => {
    return stories.data.reduce(
        (result, value) => result + value.num_comments,
        0
    );
};

const extractSearchTerm = (url: string) => url.replace(API_ENDPOINT, '');

const getLastSearches = (urls: string[]) => {
    return urls
        .reduce((result: string[], url: string, index: number) => {
            const searchTerm = extractSearchTerm(url); // takes each url & extarcts searchTerm

            if (index === 0) {
                // first iteration
                return result.concat(searchTerm); // apend to result
            }

            const previousSearchTerm = result[result.length - 1]; // find previousSearchTerm which is the last in the array

            if (searchTerm === previousSearchTerm) {
                // check if current searchTerm === previousSearchTerm
                return result; // if so do nothing i.e prevent duplicated searches in a row
            } else {
                return result.concat(searchTerm); // if it's different then append it
            }
        }, []) // initial value - empty array
        .slice(-6) // extract last 6 elements
        .slice(0, -1); // then remove the last one so we don't show current search as a button
};

const getUrl = (searchTerm: string) => `${API_ENDPOINT}${searchTerm}`;

const App = () => {
    const [searchTerm, setSearchTerm] = useSemiPersistentState(
        'search',
        'React'
    );

    const [urls, setUrls] = React.useState([getUrl(searchTerm)]);

    const [stories, dispatchStories] = React.useReducer(storiesReducer, {
        data: [],
        isLoading: false,
        isError: false,
    });

    const handleFetchStories = React.useCallback(async () => {
        // useCallback creates/returns new version of this callback handler when one of its dependancies change
        dispatchStories({
            type: 'STORIES_FETCH_INIT',
        });

        try {
            const lastUrl = urls[urls.length - 1];
            const result = await axios.get(lastUrl);
            dispatchStories({
                type: 'STORIES_FETCH_SUCCESS',
                payload: result.data.hits,
            });
        } catch {
            dispatchStories({ type: 'STORIES_FETCH_FAILURE' });
        }
    }, [urls]); // <- dependancy

    React.useEffect(() => {
        handleFetchStories();
    }, [handleFetchStories]);

    const handleRemoveStory = React.useCallback((item: Story) => {
        dispatchStories({
            type: 'REMOVE_STORY',
            payload: item,
        });
    }, []);

    const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        handleSearch(searchTerm);
        event.preventDefault();
    };

    const handleLastSearch = (searchTerm: string) => {
        setSearchTerm(searchTerm);
        handleSearch(searchTerm);
    };

    const handleSearch = (searchTerm: string) => {
        const url = getUrl(searchTerm);
        setUrls(urls.concat(url));
    };

    // useMemo returns memoized value from calling the function; then will call it only when there will be change in dependancy - stories
    const sumComments = React.useMemo(() => getSumComments(stories), [stories]);

    const lastSearches = getLastSearches(urls);

    return (
        <div className={styles.container}>
            <h1 className={styles.headlinePrimary}>
                My Hacker Stories with {sumComments} comments.
            </h1>

            <img src={logo} className={styles.logo} alt="logo" />

            <SearchForm
                searchTerm={searchTerm}
                onSearchInput={handleSearchInput}
                onSearchSubmit={handleSearchSubmit}
            />

            <LastSearches
                lastSearches={lastSearches}
                onLastSearch={handleLastSearch}
            />

            {stories.isError && <p>Something went wrong...</p>}

            {stories.isLoading ? (
                <p>Loading...</p>
            ) : (
                <List list={stories.data} onRemoveItem={handleRemoveStory} />
            )}
        </div>
    );
};

export default App;
export { storiesReducer };
