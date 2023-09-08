import * as React from 'react'
import axios from 'axios'
import './App.css'

  const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query='

  const useStorageState = (
    key: string, 
    initialState: string
    ): [string, (newValue: string) => void] => {
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  )

  React.useEffect(() => {
    localStorage.setItem(key, value)
    }, [key, value])

    return [value, setValue]
  }

  const fetchInit  = 'STORIES_FETCH_INIT'
  const fetchSuccess = 'STORIES_FETCH_SUCCESS'
  const fetchFail = 'STORIES_FETCH_FAILURE'
  const remove = 'REMOVE_STORY'

  type StoriesState = {
    data: Stories
    isLoading: boolean
    isError: boolean
  }

  interface StoriesFetchInitAction {
    type: 'STORIES_FETCH_INIT'
  }

  interface StoriesFetchSuccessAction {
    type: 'STORIES_FETCH_SUCCESS'
    payload: Stories
  }

  interface StoriesFetchFailureAction {
    type: 'STORIES_FETCH_FAILURE'
  }

  interface StoriesRemoveAction {
    type: 'REMOVE_STORY'
    payload: Story
  }

  type StoriesAction =
    | StoriesFetchInitAction
    | StoriesFetchSuccessAction
    | StoriesFetchFailureAction
    | StoriesRemoveAction

  const storiesReducer = (state: StoriesState, action: StoriesAction) => {
    switch (action.type) {
      case fetchInit :
      return {
        ...state,
        isLoading: true,
        isError: false,
      }
      case fetchSuccess :
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      }
      case fetchFail :
        return {
          ...state,
        isLoading: false,
        isError: true,
        }
      case remove :
        return {
          ...state,
          data: state.data.filter(
            (story) => action.payload.objectID !== story.objectID
          ),
        }
    default:
      throw new Error()
    }
  }

const App = () => {

  const [searchTerm, setSearchTerm] = useStorageState(
    'search',
    'React'
    )

  const [url, setUrl] = React.useState(
    `${API_ENDPOINT}${searchTerm}`
    )

  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    setUrl(`${API_ENDPOINT}${searchTerm}`)

    event.preventDefault();
  }
  
  const [stories, dispatchStories] = React.useReducer(
    storiesReducer,
    { data: [], isLoading: false, isError: false }
  )

  const handleFetchStories = React.useCallback(() => {
    dispatchStories({ type: fetchInit });

    axios
      .get(url)
      .then((result) => { 
        dispatchStories({
          type: fetchSuccess,
          payload: result.data.hits,
        })
    })
    .catch(() => 
      dispatchStories({ type: fetchFail })
      )
      }, [url]);   

  React.useEffect(() => {
    handleFetchStories()
  }, [handleFetchStories])

  const handleRemoveStory = (item: Story) => {
    dispatchStories({
      type: remove,
      payload: item,
    })
  }
  
  console.log('B:App')

  return (
    <div className='container'>onRemoveItem
      <h1 className='headline_primary'>My Hacker Stories</h1>

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
  )
}

type InputWithLabelProps = {
  id: string
  value: string
  type?: string
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  isFocused?: boolean
  children: React.ReactNode
}

  const InputWithLabel = ({ id, value, type='text', isFocused, onInputChange, children}: InputWithLabelProps) => {
    const inputRef = React.useRef<HTMLInputElement>(null!)

    React.useEffect(() => {
      if (isFocused && inputRef.current) {
        inputRef.current.focus()
      }
    }, [isFocused])
  return (  
  <>
    <label htmlFor={id} className='label'>{children}</label>
    &nbsp;
    <input 
      id={id}
      type={type}
      value={value}
      onChange={onInputChange}
      className='input'
      />
    </>
    )
  }

  type Story = {
    objectID: string
    url: string
    title: string
    author: string
    num_comments: number
    points: number
  }

  type Stories = Array<Story>

  type ListProps = {
    list: Stories
    onRemoveItem: (item: Story) => void
  }

  const List = ({ list, onRemoveItem }: ListProps) =>(
        <ul>
        {list.map((item) => (
          <Item
          key={item.objectID}
          item={item}
          onRemoveItem={onRemoveItem}
          />
        ))}
        </ul>
  )

  type ItemProps = {
    item: Story;
    onRemoveItem: (item: Story) => void
  }

  const Item = ({ item, onRemoveItem }: ItemProps) => (
    <li className='item'>
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
        type='button'
        onClick={() => onRemoveItem(item)}
        className='button button_small'
      >Dismiss</button>
    </span>
    </li>
  )

  type SearchFormProps = {
    searchTerm: string
    onSearchInput: (event: React.ChangeEvent<HTMLInputElement>) => void
    onSearchSubmit: (event: React.ChangeEvent<HTMLFormElement>) => void
  }

  const SearchForm = ({
    searchTerm,
    onSearchInput,
    onSearchSubmit,
  }: SearchFormProps) => (
    <form onSubmit={onSearchSubmit} className='search-form'>
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
        className='button_large'
      >
        Submit
      </button>
    </form>
  )

export default App;