import React, { useState, useEffect, useRef } from 'react';
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
  Image,
  AppState,
} from 'react-native';
import codePush from '@code-push-next/react-native-code-push';

// Define Todo item type
interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

interface UpdateMetadata {
  type: string;
  severity: string;
  description: string;
}

const App = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todoText, setTodoText] = useState('');
  const isChecking = useRef(false);
  const listenerSetup = useRef(false);

  const setupAppStateListener = () => {
    if (listenerSetup.current) {
      console.log('[CodePush] AppState listener already set up, skipping...');
      return null;
    }

    // Listen for app state changes
    let appState = AppState.currentState;
    console.log('[CodePush] Initial app state:', appState);
    
    const handleAppStateChange = (nextAppState: string) => {
      console.log(`[CodePush] App state change: ${appState} -> ${nextAppState}`);
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        console.log('[CodePush] App foregrounded, checking for updates...');
        checkForUpdate();
      }
      appState = nextAppState as any;
    };

    console.log('[CodePush] Setting up AppState listener...');
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    console.log('[CodePush] AppState listener set up:', subscription);
    
    listenerSetup.current = true;
    return subscription;
  };


  const checkForUpdate = async () => {
    if (isChecking.current) {
      return;
    }

    try {
      isChecking.current = true;
      console.log('[CodePush] Checking for update manually...');

      const update = await codePush.checkForUpdate();

      if (update) {
        console.log('[CodePush] Update found:', update);

        try {
          const metadata: UpdateMetadata = JSON.parse(update.description || '{}');
          console.log('[CodePush] Parsed metadata:', metadata);

          const severity = parseInt(metadata.severity || '0', 10);

          if (severity > 3) {
            console.log('[CodePush] High severity update (>3), installing...');

            Alert.alert(
              'Update Available',
              `${metadata.description}\n\nThis update will be installed now.`,
              [
                {
                  text: 'Install Now',
                  onPress: async () => {
                    try {
                      console.log('[CodePush] Starting immediate sync...');
                      console.log('[CodePush] Update object:', update);
                      
                      // Download and install the update
                      console.log('[CodePush] Downloading update...');
                      const downloadedPackage = await update.download();
                      console.log('[CodePush] Download completed:', downloadedPackage);
                      
                      console.log('[CodePush] Installing update...');
                     
                      await downloadedPackage.install(codePush.InstallMode.IMMEDIATE);
                      console.log('[CodePush] Install completed, app should restart now');
                    } catch (error) {
                      console.log('[CodePush] Error during manual update:', error);
                    }
                  },
                },
              ],
            );
          } else {
            console.log(`[CodePush] Low severity update (${severity}), skipping installation`);
          }
        } catch (parseError) {
          console.log('[CodePush] Error parsing update metadata:', parseError);
        }
      } else {
        console.log('[CodePush] No update available');
      }
    } catch (error) {
      console.log('[CodePush] Error checking for update:', error);
    } finally {
      isChecking.current = false;
    }
  };

  const initializeApp = () => {
    console.log('[CodePush] ==> Initializing app instance');
    
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

    // Log current package information on app start
    codePush.getUpdateMetadata().then((metadata) => {
      if (metadata) {
        console.log('[CodePush] Running binary version: ' + metadata.appVersion);
        console.log('[CodePush] Running with CodePush update: ' + metadata.label);
        console.log('[CodePush] Package hash: ' + metadata.packageHash);
        console.log('[CodePush] Package description: ' + metadata.description);
      } else {
        console.log('[CodePush] Running binary version with no CodePush updates installed');
      }
    }).catch(err => {
      console.log('[CodePush] Error getting metadata:', err);
    });

    // Check for updates (this will also setup AppState listener if needed)
    checkForUpdate();

    if (!listenerSetup.current) {
        console.log('[CodePush] Setting up AppState listener ...');
        setupAppStateListener();
      }
    
    return null;
  };

  useEffect(() => {
    console.log('[CodePush] ==> App useEffect triggered - fresh app instance');
    
    // Initialize the app
    initializeApp();
    
    return () => {
      console.log('[CodePush] Cleaning up listeners...');
      // Reset the listener setup flag so it can be re-created
      listenerSetup.current = false;
    };
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
        <Text style={styles.title}>Todo List Tests v0.0.2+3</Text>
        <Text style={styles.subtitle}>With CodePush Integration *</Text>
        <Image
          source={require('./assets/favicon.png')}
          style={styles.image}
        />
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
  image: {
    width: 50,
    height: 50,
    marginTop: 20, // Add some space between the text and image
  },
});

export default App;
