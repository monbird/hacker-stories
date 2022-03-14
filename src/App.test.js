import {
    render,
    screen,
    fireEvent,
    act,
    waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import App, {
    storiesReducer,
    SearchForm,
    // InputWithLabel,
    // List,
    Item,
} from './App';

const storyOne = {
    title: 'React',
    url: 'https://reactjs.org/',
    author: 'Jordan Walke',
    num_comments: 3,
    points: 4,
    objectID: 0,
};

const storyTwo = {
    title: 'Redux',
    url: 'https://redux.js.org/',
    author: 'Dan Abramov, Andrew Clark',
    num_comments: 2,
    points: 5,
    objectID: 1,
};

const stories = [storyOne, storyTwo];

jest.mock('axios');

describe('storiesReducer', () => {
    test('removes a story from all stories', () => {
        // Setup
        const action = { type: 'REMOVE_STORY', payload: storyOne };
        const state = { data: stories, isLoading: false, isError: false };

        const expectedState = {
            data: [storyTwo],
            isLoading: false,
            isError: false,
        };

        // Exercise
        const newState = storiesReducer(state, action);

        // Verify
        expect(newState).toStrictEqual(expectedState);
    });

    test('stories fetching initialisation', () => {
        // Setup
        const action = { type: 'STORIES_FETCH_INIT' };
        const state = { data: [], isLoading: false, isError: false };

        const expectedState = {
            data: [],
            isLoading: true,
            isError: false,
        };

        // Exercise
        const newState = storiesReducer(state, action);

        // Verify
        expect(newState).toStrictEqual(expectedState);
    });

    test('stories fetching success', () => {
        // Setup
        const action = { type: 'STORIES_FETCH_SUCCESS', payload: stories };
        const state = { data: [], isLoading: false, isError: false };

        const expectedState = {
            data: stories,
            isLoading: false,
            isError: false,
        };

        // Exercise
        const newState = storiesReducer(state, action);

        // Verify
        expect(newState).toStrictEqual(expectedState);
    });

    test('stories fetching failure', () => {
        // Setup
        const action = { type: 'STORIES_FETCH_FAILURE' };
        const state = { data: [], isLoading: false, isError: false };

        const expectedState = {
            data: [],
            isLoading: false,
            isError: true,
        };

        // Exercise
        const newState = storiesReducer(state, action);

        // Verify
        expect(newState).toStrictEqual(expectedState);
    });
});

describe('Item', () => {
    test('renders all properties', () => {
        render(<Item item={storyOne} />);
        // screen.debug();
        expect(screen.getByText('Jordan Walke')).toBeInTheDocument();
        expect(screen.getByText('React')).toHaveAttribute(
            'href',
            'https://reactjs.org/'
        );
    });

    test('renders a clickable dismiss button', () => {
        render(<Item item={storyOne} />);

        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('clicking the dismiss button calls the callback handler', () => {
        const handleRemoveItem = jest.fn();
        // const handleRemoveItem = jest.fn(() => {
        //     return 'hello';
        // });

        render(<Item item={storyOne} onRemoveItem={handleRemoveItem} />);

        fireEvent.click(screen.getByRole('button'));
        // userEvent.click(screen.getByRole('button'));

        expect(handleRemoveItem).toHaveBeenCalledTimes(1);
        // expect(handleRemoveItem()).toBe('hello');
    });

    test('renders snapshot', () => {
        const { container } = render(<Item item={storyOne} />);
        expect(container.firstChild).toMatchSnapshot();
    });
});

describe('SearchForm', () => {
    const SearchFormProps = {
        searchTerm: 'React',
        onSearchInput: jest.fn(),
        onSearchSubmit: jest.fn(),
    };

    test('renders the input field with its value', () => {
        render(<SearchForm {...SearchFormProps} />);
        // screen.debug();
        expect(screen.getByDisplayValue('React')).toBeInTheDocument();
    });

    test('renders the correct label', () => {
        render(<SearchForm {...SearchFormProps} />);
        expect(screen.getByLabelText(/Search/)).toBeInTheDocument();
    });

    test('calls onSearchInput on input field change', () => {
        render(<SearchForm {...SearchFormProps} />);

        // fireEvent.change(screen.getByDisplayValue('React'), {
        //     target: { value: 'Redux' },
        // });

        // userEvent.paste(screen.getByDisplayValue('React'), 'Redux');
        // expect(SearchFormProps.onSearchInput).toHaveBeenCalledTimes(1);

        userEvent.type(screen.getByDisplayValue('React'), 'Redux');
        expect(SearchFormProps.onSearchInput).toHaveBeenCalledTimes(5);
    });

    test('calls onSearchSubmit on button submit click', () => {
        render(<SearchForm {...SearchFormProps} />);
        screen.debug();
        fireEvent.submit(screen.getByRole('button'));

        expect(SearchFormProps.onSearchSubmit).toHaveBeenCalledTimes(1);
    });

    test('renders snapshot', () => {
        const { container } = render(<SearchForm {...SearchFormProps} />);
        expect(container.firstChild).toMatchSnapshot();
    });
});

describe('App', () => {
    test('succeeds fetching data', async () => {
        const promise = Promise.resolve({ data: { hits: stories } });
        axios.get.mockImplementationOnce(() => promise);

        render(<App />);
        // screen.debug();
        expect(screen.queryByText(/loading/i)).toBeInTheDocument();

        // await act(() => promise);
        await waitFor(() => promise);
        // screen.debug();
        expect(screen.queryByText(/loading/i)).toBeNull();

        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('Redux')).toBeInTheDocument();
        expect(screen.getAllByText('Dismiss').length).toBe(2);
    });

    test('fails fetching data', async () => {
        const promise = Promise.reject();
        axios.get.mockImplementationOnce(() => promise);

        render(<App />);

        expect(screen.queryByText(/Loading/)).toBeInTheDocument();

        try {
            await waitFor(() => promise);
        } catch (error) {
            // eslint-disable-next-line jest/no-conditional-expect
            expect(screen.queryByText(/Loading/)).toBeNull();
            // eslint-disable-next-line jest/no-conditional-expect
            expect(screen.queryByText(/went wrong/)).toBeInTheDocument();
        }
    });

    test('removes a story', async () => {
        const promise = Promise.resolve({ data: { hits: stories } });
        axios.get.mockImplementationOnce(() => promise);

        render(<App />);

        await waitFor(() => promise);

        expect(screen.getAllByText('Dismiss').length).toBe(2);
        expect(screen.getByText('Jordan Walke')).toBeInTheDocument();

        userEvent.click(screen.getAllByText('Dismiss')[0]);

        expect(screen.getAllByText('Dismiss').length).toBe(1);
        expect(screen.queryByText('Jordan Walke')).toBeNull();
    });

    test('searches for specific stories', async () => {
        const reactPromise = Promise.resolve({ data: { hits: stories } });

        const anotherStory = {
            title: 'JavaScript',
            url: 'https://en.wikipedia.org/wiki/JavaScript',
            author: 'Brendan Eich',
            num_comments: 15,
            points: 10,
            objectID: 3,
        };

        const javascriptPromise = Promise.resolve({
            data: { hits: [anotherStory] },
        });

        axios.get.mockImplementation((url) => {
            if (url.includes('React')) {
                return reactPromise;
            }
            if (url.includes('JavaScript')) {
                return javascriptPromise;
            }

            throw Error();
        });

        // Initial render
        render(<App />);

        // 1. First data fetching
        await waitFor(() => reactPromise);

        expect(screen.queryByDisplayValue('React')).toBeInTheDocument();
        expect(screen.queryByDisplayValue('JavaScript')).toBeNull();
        expect(screen.queryByText('Jordan Walke')).toBeInTheDocument();
        expect(
            screen.queryByText('Dan Abramov, Andrew Clark')
        ).toBeInTheDocument();
        expect(screen.queryByText('Brendan Eich')).toBeNull();

        // 2. User interaction: changing input field value in Search component
        // fireEvent.change(screen.queryByDisplayValue('React'), {
        //     target: { value: 'JavaScript' },
        // });
        const input = screen.queryByDisplayValue('React');
        userEvent.clear(input);
        userEvent.type(input, 'JavaScript');

        expect(screen.queryByDisplayValue('React')).toBeNull();
        expect(screen.queryByDisplayValue('JavaScript')).toBeInTheDocument();

        // 3. Submitting the form
        // fireEvent.submit(screen.queryByText('Submit'));
        userEvent.click(screen.queryByText('Submit'));

        // 4. Second data fetching: retriving new data from the API
        await waitFor(() => javascriptPromise);

        expect(screen.queryByText('Jordan Walke')).toBeNull();
        expect(screen.queryByText('Dan Abramov, Andrew Clark')).toBeNull();
        expect(screen.queryByText('Brendan Eich')).toBeInTheDocument();
    });
});
