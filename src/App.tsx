import React from 'react';
import axios from 'axios';
import styles from './App.module.css';
import logo from './logo.svg';
import List from './List';
import SearchForm from './SearchForm';
import LastSearches from './LastSearches';

// const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=react&page=0';
const API_BASE = 'https://hn.algolia.com/api/v1';
const API_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const HITS_PER_PAGE = 'hitsPerPage=20';

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
    page: number;
    isLoading: boolean;
    isError: boolean;
};

interface StoriesFetchInitAction {
    type: 'STORIES_FETCH_INIT';
}

interface StoriesFetchSuccessAction {
    type: 'STORIES_FETCH_SUCCESS';
    payload: {
        list: Stories;
        page: number;
    };
}

interface StoriesFetchFailureAction {
    type: 'STORIES_FETCH_FAILURE';
}

interface StoriesRemoveAction {
    type: 'REMOVE_STORY';
    payload: Story;
}

interface StoriesNextPageAction {
    type: 'STORIES_NEXT_PAGE';
}

type StoriesAction =
    | StoriesFetchInitAction
    | StoriesFetchSuccessAction
    | StoriesFetchFailureAction
    | StoriesRemoveAction
    | StoriesNextPageAction;

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
                // for initial & last searches use data/list from the first page/0 otherwise concat/extend the current list (i.e. when fetching with 'More' btn)
                data:
                    action.payload.page === 0
                        ? action.payload.list
                        : state.data.concat(action.payload.list),
                page: action.payload.page,
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
        case 'STORIES_NEXT_PAGE':
            return {
                ...state,
                page: state.page + 1,
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

const extractSearchTerm = (url: string) => {
    const urlUrl = new URL(url);
    const query = urlUrl.searchParams.get('query');
    return query || '';
};

// alternative longer solution:
// const extractSearchTerm = (url: string) =>
//     url //  url at the start: 'https://hn.algolia.com/api/v1/search?query=react&page=0&hitsPerPage=10'
//         .substring(url.lastIndexOf('?') + 1, url.lastIndexOf('&') - 7) // url after substring: 'query=react'
//         .replace(PARAM_SEARCH, ''); // url after replace: 'react'

const getLastSearches = (urls: string[]) => {
    return urls
        .reduce((result: string[], url: string, index: number) => {
            const searchTerm = extractSearchTerm(url); // takes each url & extarcts searchTerm

            if (index === 0) {
                // first iteration
                return result.concat(searchTerm); // append to result
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

const getUrl = (searchTerm: string, page: number) =>
    `${API_BASE}${API_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${HITS_PER_PAGE}`;

const App = () => {
    const [searchTerm, setSearchTerm] = useSemiPersistentState(
        'search',
        'React'
    );

    const [urls, setUrls] = React.useState([getUrl(searchTerm, 0)]);

    const [stories, dispatchStories] = React.useReducer(storiesReducer, {
        data: [],
        page: 0,
        isLoading: false,
        isError: false,
    });

    const [lastElement, _setLastElement] = React.useState(null);

    // modify setLastElement method to prevent setting last element to null
    const setLastElement = (element: any) => {
        if (element) {
            _setLastElement(element);
        }
    };

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
                payload: {
                    list: result.data.hits,
                    page: result.data.page,
                },
            });
        } catch {
            dispatchStories({ type: 'STORIES_FETCH_FAILURE' });
        }
    }, [urls]); // <- dependancy

    React.useEffect(() => {
        handleFetchStories();
    }, [handleFetchStories]);

    // as the page number changes, the API will be called again and more stories will be fetched.
    React.useEffect(() => {
        if (stories.page > 0) {
            handleMore(stories.page);
        }
    }, [stories.page]);

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
        handleSearch(searchTerm, 0);
        event.preventDefault();
    };

    const handleLastSearch = (searchTerm: string) => {
        setSearchTerm(searchTerm);
        handleSearch(searchTerm, 0);
    };

    const handleSearch = (searchTerm: string, page: number) => {
        const url = getUrl(searchTerm, page);
        setUrls(urls.concat(url));
    };

    const handleMore = (pageNum: number) => {
        const lastUrl = urls[urls.length - 1];
        const searchTerm = extractSearchTerm(lastUrl);
        handleSearch(searchTerm, pageNum);
    };

    // creates useRef in order to access DOM element (here <Item/> element)
    const observer: any = React.useRef();

    // defines the Intersection Observer and stores it the previously created observer variable. The intersection observer have a callback function which accept array of all the intersecting objects. But since, we will be passing only last element to it, we are always checking the 0th entry of this array. If that element intersects means become visible, we will increment the page number.
    React.useEffect(() => {
        observer.current = new IntersectionObserver((entries) => {
            const first = entries[0];
            if (first.isIntersecting) {
                dispatchStories({
                    type: 'STORIES_NEXT_PAGE',
                });
            }
        });
    }, []);

    // when the value of lastElement change the useEffect will run and pass the lastElement to our intersection observer to observe. The observer will then check the intersection of this element and increment the page count once this happens.
    React.useEffect(() => {
        const currentElement = lastElement;
        const currentObserver = observer.current;

        if (currentElement && currentObserver.observe) {
            currentObserver.observe(currentElement);
        }

        return () => {
            if (currentElement && currentObserver.unobserve) {
                currentObserver.unobserve(currentElement);
            }
        };
    }, [lastElement]);

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

            {stories.isError ? (
                <p>Something went wrong...</p>
            ) : (
                <div>
                    <List
                        list={stories.data}
                        onRemoveItem={handleRemoveStory}
                        setLastElement={setLastElement} // passes the setting function to the <Item /> element
                    />
                    {stories.isLoading ? <p>Loading...</p> : <></>}
                </div>
            )}
        </div>
    );
};

export default App;
export { storiesReducer };
