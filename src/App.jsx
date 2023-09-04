import * as React from 'react';
import axios from 'axios';
import styles from './App.module.css';
import cs from 'classnames';

  const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

  const useStorageState = (key, initialState) => {
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  );

  React.useEffect(() => {
    localStorage.setItem(key, value);
    }, [key, value]);

    return [value, setValue];
  };

  const fetchInit  = 'STORIES_FETCH_INIT';
  const fetchSuccess = 'STORIES_FETCH_SUCCESS';
  const fetchFail = 'STORIES_FETCH_FAILURE';
  const remove = 'REMOVE_STORY';

  const storiesReducer = (state, action) => {
    switch (action.type) {
      case fetchInit :
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
      case fetchSuccess :
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
      case fetchFail :
        return {
          ...state,
        isLoading: false,
        isError: true,
        };
      case remove :
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

const App = () => {
  const [searchTerm, setSearchTerm] = useStorageState(
    'search',
    'React'
    );

  const [url, setUrl] = React.useState(
    `${API_ENDPOINT}${searchTerm}`
    );

  const handleSearchInput = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    setUrl(`${API_ENDPOINT}${searchTerm}`);

    event.preventDefault();
  };
  
  const [stories, dispatchStories] = React.useReducer(
    storiesReducer,
    { data: [], isLoading: false, isError: false }
  );

  const handleFetchStories = React.useCallback(() => {
    dispatchStories({ type: fetchInit });

    axios
      .get(url)
      .then((result) => { 
        dispatchStories({
          type: fetchSuccess,
          payload: result.data.hits,
        });
    })
    .catch(() => 
      dispatchStories({ type: fetchFail })
      );
      }, [url]);   

  React.useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);

  const handleRemoveStory = (item) => {
    dispatchStories({
      type: remove,
      payload: item,
    })
  };

  const List = ({ list, onRemoveItem }) => (
        <ul>
        {list.map(({ objectID, ...item }) => (
          <Item 
          key={item.objectID} 
          item={item}
          onRemoveItem={onRemoveItem}
          />
        ))}
        </ul>
        );

  return (
    <div className={styles.container}>
      <h1 className={styles.headlinePrimary}>My Hacker Stories</h1>

      <SearchForm
        searchTerm={searchTerm}
        onSearchInput={handleSearchInput}
        onSearchSubmit={handleSearchSubmit}
      />
  
      {stories.isError && <p>Something went wrong ...</p>}

      {stories.isLoading ? (
        <p>Loading ...</p>
      ) : (
        <List list={stories.data} onRemoveItem={handleRemoveStory} />
      )}

    </div>
  ); 
};

  const InputWithLabel = ({ id, value, type='text', isFocused, onInputChange, children}) => {
    const inputRef = React.useRef();

    React.useEffect(() => {
      if (isFocused && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isFocused]);
  return (  
  <>
    <label htmlFor={id} className={styles.label}>{children}</label>
    &nbsp;
    <input 
      id={id}
      type={type}
      value={value}
      onChange={onInputChange}
      className={styles.input}
      />
    </>
    )
  };
  
  const Item = ({ item, onRemoveItem }) => (
    <li className={styles.item}>
    <span style={{ width: '40%'}}>
    <a href={item.url}>{item.title}</a>
    </span>
    <ul>
    <li><span style={{ width: '30%' }}>{item.author}</span></li>
    </ul>
    <ul>
    <li><span style={{ width: '10%' }}>{item.num_comments}</span></li>
    </ul>
    <ul>
    <li><span style={{ width: '10%' }}>{item.points}</span></li>
    </ul>
    <span style={{ width: '10%' }}>
      <button 
        type="button" 
        onClick={() => onRemoveItem(item)}
        className={`${styles.button} ${styles.buttonSmall}`}
      >Dismiss</button>
    </span>
    </li>
    );

  const SearchForm = ({
    searchTerm,
    onSearchInput,
    onSearchSubmit,
  }) => (
    <form onSubmit={onSearchSubmit} className={styles.searchForm}>
      <InputWithLabel 
      id='search' 
      value={searchTerm}
      isFocused
      onInputChange={onSearchInput}
      >
      Searching for <strong>{searchTerm}</strong>
      <br />
      </InputWithLabel>

      <button
        type='submit'
        disabled={!searchTerm}
        className={cs(styles.button, styles.buttonLarge)}
      >
        Submit
      </button>
    </form>
  )

export default App;