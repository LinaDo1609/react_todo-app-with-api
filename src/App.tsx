import React, { useEffect, useMemo, useState } from 'react';
import { Footer } from './components/footer/Footer';
import { ErrorMessage } from './components/errorMessage/Error';
import { Header } from './components/header/Header';
import { TodoList } from './components/todoList/TodoList';
import { addTodo, deleteTodo, getTodos, updateTodo } from './api/todos';
import { Todo } from './types/Todo';

export const App: React.FC = () => {
  enum FILTERS {
    all = 'all',
    completed = 'completed',
    active = 'active',
  }

  const [todoList, setTodoList] = useState<Todo[]>([]);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [shouldFocus, setShouldFocus] = useState(true);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);

  const filteredTodos = useMemo(() => {
    return todoList.filter(todo => {
      switch (filter) {
        case FILTERS.completed:
          return todo.completed === true;
        case FILTERS.active:
          return todo.completed === false;
        default:
          return true;
      }
    });
  }, [todoList, filter, FILTERS.completed, FILTERS.active]);

  const completedTodos = useMemo(() => {
    return todoList.filter(todo => todo.completed === true);
  }, [todoList]);

  const unCompletedCount = useMemo(() => {
    return todoList.filter(todo => todo.completed === false).length;
  }, [todoList]);

  const isCompleted = useMemo(() => {
    const completed = todoList.find(todo => todo.completed === false);

    return completed ? false : true;
  }, [todoList]);

  //  перша загрузка данних на сторінку
  useEffect(() => {
    getTodos()
      .then(data => {
        setTodoList(data);
      })
      .catch(() => {
        setError('Unable to load todos');
      });
  }, []);

  // прибираємо помилку через 3 секунди, а після вже видаляємо таймер
  useEffect(() => {
    const timer = setTimeout(() => {
      setError(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [error]);

  // обробка фільтрів
  const handleFilter = (query: string) => {
    setFilter(query);
  };

  const addPost = (title: string) => {
    setError(null); // очищаємо помилку, якщо вона була
    setShouldFocus(false); // вимикаємо фокус на інпуті
    setTempTodo({
      id: 0,
      userId: 3217,
      title: title,
      completed: false,
    });

    return addTodo(title)
      .then(newPost => {
        setTodoList(prevList => [...prevList, newPost]);
        setTempTodo(null);
        setShouldFocus(true); // знову вмикаємо фокус на інпуті
      })
      .catch(() => {
        setError('Unable to add a todo');
        setTempTodo(null);
        setShouldFocus(true);

        return Promise.reject();
      });
  };

  // видалення todo
  const deletePost = (postId: number) => {
    setError(null);
    setShouldFocus(false);

    return deleteTodo(postId)
      .then(() => {
        setTodoList(prevTodos => prevTodos.filter(todo => todo.id !== postId));
        setShouldFocus(true);
      })
      .catch(() => {
        setError('Unable to delete a todo');

        return Promise.reject();
      });
  };

  // оновлення todo
  const updatePost = (todo: Todo) => {
    setError(null);

    return updateTodo(todo)
      .then(updatedTodo => {
        setTodoList(prevTodos =>
          prevTodos.map(t => (t.id === updatedTodo.id ? updatedTodo : t)),
        );
      })
      .catch(() => {
        setError('Unable to update a todo');

        return Promise.reject();
      });
  };

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          todoList={todoList}
          isCompletedTodo={isCompleted}
          addPost={addPost}
          setError={setError}
          shouldFocus={shouldFocus}
          updatePost={updatePost}
        />

        <TodoList
          todoList={filteredTodos}
          todoTemp={tempTodo}
          deleteTodo={deletePost}
          updateTodo={updatePost}
        />

        {todoList.length > 0 && (
          <Footer
            filter={handleFilter}
            unCompletedCount={unCompletedCount}
            completed={completedTodos}
            deleteAll={deletePost}
          />
        )}
      </div>

      <ErrorMessage error={error} hideError={setError} />
    </div>
  );
};
