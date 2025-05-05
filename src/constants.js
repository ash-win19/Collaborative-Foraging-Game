export const scaleFactor = 4;

export const dialogueData = { 
    houseA: 'Welcome to the second level, today we gonna teach you the basic print in Java! Please go find a tree on the right side, it gonna tell you some hints!',
    hint2A: 'Hola! Welcome to the world of Java! in Java we usually use System.out.print() to print something. Please go find a elf for further hint!',
    hint1A: 'Greetings, traveler! Your friend need to use the ancient magic of Java to print the words "Hello World!"! for you... off you go, seek the Wizard! But be warned — "tis said he brooks no foolishness!"',
    hint3A: 'Mark my words, young one: you must place a ";" after each statement in Java...Fail to do so, and you shall be bound to this realm for all eternity! Go to the lower left corner to escape this room!',

    houseB: 'Welcome to the second level, today we gonna teach you the basic print in Java! Please go find the windmill on the left side, it gonna tell you some hints!',
    hint1B: 'Hola! Welcome to the world of Java! in Java we usually use System.out.print() to print something. Please go find a rabbit for further hint!',
    rabbitB: 'Hi there! Your friend needs to use Java to hop out a little "Bye!" on the screen! As for you, scurry along and find the old man — no need to be worry, he is as friendly as a basket of carrots!',
    manB: 'Ah, do not forget, my dear — you must add a ";" after each statement in Java. It keeps everything nice and proper, just like it should be! Go to the lower left corner to escape this room!',

    wizardA: 'Ah, splendid!  You’ve reached the final challenge—victory is within grasp!  But first, a magical lesson awaits: the secrets of Function Structure! To begin, seek out the computer in the Study Room! Fail, and you’ll be stuck here forever... just kidding! (Or am I?)',
    computer: '"BEEP. INITIATING FUNCTION TUTORIAL. BOOP. SYNTAX: [access][name](inputs) {actions}  public addNumbers(int a, int b) {  return(a + b);  } "public" = accessible everywhere. "addNumbers" = function name. PARAMETERS: "int a, int b" are inputs. EXECUTE WITH: addNumbers(3, 5); OUTPUT: 8. END TUTORIAL. BEEP. Go find the bed then.',
    bedA: 'Yawn... Writing functions is like snuggling into me—start with a comfy header, then curl up with the logic... zzz...public void dream(int hours, String pillow) { System.out.println("You dreamed of " + pillow + " for " + hours + " hours."); } See? "dream" is your function name... void means return nothing. "hours" and "pillow" are your sleepy inputs... Now call dream(8, "unicorns") and... snore... find .. a .. tree .. zzz',
    tree: 'Wind whispers... your friends task is to find the correct function for addNum with two integer input. For you, please go to the bookshelf next to the bed! Have a nice day!',

    wizardB: 'Ah, splendid!  You’ve reached the final challenge—victory is within grasp!  But first, a magical lesson awaits: the secrets of Function Structure! To begin, seek out the bed in the living room! Fail, and you’ll be stuck here forever... just kidding! (Or am I?)',
    bedB: 'Yawn... Writing functions is like snuggling into me—start with a comfy header, then curl up with the logic... zzz...public void dream(int hours, String pillow) { System.out.println("You dreamed of " + pillow + " for " + hours + " hours."); } See? "dream" is your function name... void means return nothing. "hours" and "pillow" are your sleepy inputs... Now call dream(8, "unicorns") and... snore... find .. a .. sofa .. zzz',
    sofa: 'INITIATING FUNCTION TUTORIAL. SYNTAX: [access][name](inputs) {actions}  public addNumbers(int a, int b) {  return(a + b);  } "public" = accessible everywhere. "addNumbers" = function name. PARAMETERS: "int a, int b" are inputs. EXECUTE WITH: addNumbers(3, 5); OUTPUT: 8. END TUTORIAL. BEEP. Go find the desk then.',
    desk: 'your friends task is to find the correct non-return function called minus with two integer input. For you, please go to the tree next to the bed! Have a nice day!',
  };

  export const quizData = {
    level1: {
      question: "How many trees are present in total",
      options: ["8", "16", "24", "23"],
      correctAnswer: "24",
    }, 
    level3: {
      question: "What is the correct answer for java function?",
      options: ["public addNumber(a, b){return a+b}", 
        "public addNumber(int a, int b){return a+b}", 
        "public void minus(int a, int b){return a-b;}", 
        "public void minus(a, b){return a-b;}"],
      correctAnswer_A: "public addNumber(int a, int b){return a+b}",
      correctAnswer_B: "public void minus(int a, int b){return a-b;}",
    }, 
    // Add more for additional levels
  };