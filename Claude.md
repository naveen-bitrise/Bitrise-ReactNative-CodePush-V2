Currently the CodePush implementation uses codepush configuration options to do the check for updates. I want to do manual check instead like below 
1. When app is foregrounded
2. When app is started as well (the pseudo code below shows only foregrouded, started has to be added.)

if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      checkForUpdate()    
}

const checkForUpdate = async () => {
  // Prevent check if one is already running
  if (isChecking.current) {
    return;
  }

  try {
    isChecking.current = true; 

    const update = await CodePush.checkForUpdate();

    if (update) {
      // parse metadata from update.description
      // decide if update needs to be downloaded
      // if (decision) {
      //   download update
      //   inform user or install on next start
      // }
    }
  } catch (error) {} f
  finally {
    isChecking.current = false; // Release the lock
  }
};

Update.description will contain a json string:
{
    "type": "hotfix",
    "severity": "3",
    "description: "description example"
}

that need to be parsed. the decision is if severity is 3 or above, it is installed, and the updated dialog is shown.