import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Alert,
} from 'react-native';
import codePush from '@code-push-next/react-native-code-push';

// Define Todo item type
interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

const App = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todoText, setTodoText] = useState('');

    // Log current package information on app start
    useEffect(() => {

      // Add custom error handler
    const originalConsoleError = console.error.bind(console);
    console.error = function(message, ...args) {
      console.log("[CodePushDebug] Error intercepted:", message, ...args);
      return originalConsoleError(message, ...args);
    };
    
    // Monitor network requests
    const originalFetch = global.fetch;
    global.fetch = function(input, init) {
      console.log("[CodePushDebug] Fetch request to:", typeof input === 'string' ? input : 'Request object');
      return originalFetch(input, init)
        .then(response => {
          console.log("[CodePushDebug] Fetch success for:", typeof input === 'string' ? input : 'Request object');
          return response;
        })
        .catch(error => {
          console.log("[CodePushDebug] Fetch error:", error);
          throw error;
        });
    };

    codePush.getUpdateMetadata().then((metadata) => {
      if (metadata) {
        console.log('[CodePush] Running binary version: ' + metadata.appVersion);
        console.log('[CodePush] Running with CodePush update: ' + metadata.label);
        console.log('[CodePush] Package hash: ' + metadata.packageHash);
        console.log('[CodePush] Package description: ' + metadata.description);
      } else {
        console.log('[CodePush] Running binary version with no CodePush updates installed');
      }

      // After getting metadata, check for updates
      console.log('[CodePush] Checking for update.');

      

    }).catch(err => {
      console.log('[CodePush] Error getting metadata:', err);
    });

    
  }, []);

  // Add new todo item
  const addTodo = () => {
    if (todoText.trim() === '') {
      Alert.alert('Error', 'Please enter a task.');
      return;
    }

    const newTodo: Todo = {
      id: Date.now().toString(),
      text: todoText,
      completed: false,
    };

    setTodos([...todos, newTodo]);
    setTodoText('');
  };

  // Toggle todo completion status
  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // Delete a todo
  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  // Render a single todo item
  const renderTodoItem = ({ item }: { item: Todo }) => (
    <View style={styles.todoItem}>
      <TouchableOpacity
        style={[styles.checkbox, item.completed && styles.checkboxChecked]}
        onPress={() => toggleTodo(item.id)}
      />
      <Text
        style={[
          styles.todoText,
          item.completed && styles.todoTextCompleted,
        ]}
      >
        {item.text}
      </Text>
      <TouchableOpacity onPress={() => deleteTodo(item.id)}>
        <Text style={styles.deleteButton}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Todo List Tests</Text>
        <Text style={styles.subtitle}>With CodePush Integration *</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task..."
          value={todoText}
          onChangeText={setTodoText}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTodo}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={todos}
        renderItem={renderTodoItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyList}>
            No tasks yet. Add a new task to get started!
          </Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  updateButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#4a69bd',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    elevation: 3,
    shadowOffset: { width: 1, height: 1 },
    shadowColor: '#333',
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  updateButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  header: {
    padding: 20,
    backgroundColor: '#4a69bd',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 20,
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: 'white',
    borderRadius: 5,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  addButton: {
    marginLeft: 10,
    backgroundColor: '#4a69bd',
    height: 50,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
    padding: 20,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 15,
    marginBottom: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4a69bd',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#4a69bd',
  },
  todoText: {
    flex: 1,
    fontSize: 16,
  },
  todoTextCompleted: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
  deleteButton: {
    color: '#ff6b6b',
    fontWeight: 'bold',
  },
  emptyList: {
    textAlign: 'center',
    color: 'gray',
    marginTop: 50,
  },
});


// CodePush configuration
const codePushOptions = {
  checkFrequency: codePush.CheckFrequency.ON_APP_START,
  installMode: codePush.InstallMode.IMMEDIATE,
  mandatoryInstallMode: codePush.InstallMode.IMMEDIATE,
  updateDialog: {
    appendReleaseDescription: true,
    title: "Update Available",
    descriptionPrefix: "\n\nRelease Notes:\n",
    mandatoryContinueButtonLabel: "Install Now",
    mandatoryUpdateMessage: "An update is available that must be installed.",
    optionalIgnoreButtonLabel: "Later",
    optionalInstallButtonLabel: "Install Now",
    optionalUpdateMessage: "An update is available. Would you like to install it?"
  }
};


// Wrap and export your app with CodePush
export default codePush(codePushOptions)(App);
//export default codePush(App);