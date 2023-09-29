#include <fcntl.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

#define MAX_COMMAND_LENGTH 1024
#define MAX_BUFFER_LENGTH 1024

int main(int argc, char *argv[]) {
  // Parse command-line arguments
  if (argc < 2) {
    fprintf(stderr, "Usage: %s <command>\n", argv[0]);
    return 1;
  }
  const char *command = argv[1];

  // Split command into steps
  char *stepCommands[4];
  char *stepHeadings[4];
  int numSteps = 0;
  char *token = strtok((char *)command, "|");
  while (token != NULL && numSteps < 4) {
    stepCommands[numSteps] = strdup(token);
    stepHeadings[numSteps] = strdup(token);
    numSteps++;
    token = strtok(NULL, "|");
  }

  // Create pipes for each step of the command
  int pipes[numSteps - 1][2];
  for (int i = 0; i < numSteps - 1; i++) {
    if (pipe(pipes[i]) == -1) {
      perror("Failed to create pipe");
      return 1;
    }
  }

  int flags = fcntl(STDOUT_FILENO, F_GETFL);
  if (flags == -1) {
      perror("Failed to get file descriptor flags");
      return 1;
  } else {
      printf("STDOUT_FILENO is a valid file descriptor with flags: %d\n", flags);
  }

  // Execute each step of the command and store output in a temporary buffer
  char stepBuffer[4][MAX_BUFFER_LENGTH];
  for (int i = 0; i < numSteps; i++) {
    printf("Executing step %d of %d\n", i + 1, numSteps);
    char fullCommand[MAX_COMMAND_LENGTH];
    snprintf(fullCommand, MAX_COMMAND_LENGTH, "%s", stepCommands[i]);
    printf("Executing command '%s'\n", fullCommand);

    if (i > 0) {
      // Write input to pipe from previous step
      write(pipes[i - 1][1], stepBuffer[i - 1], strlen(stepBuffer[i - 1]));
      close(pipes[i - 1][1]);
    }

    printf("---Executing command '%s'\n", fullCommand);

    if (i < numSteps - 1) {
      printf("dup2(pipes[%d][0], STDIN_FILENO);\n", i);
      // Redirect output to pipe to next step
      dup2(pipes[i][1], STDOUT_FILENO);
      printf("dup2(pipes[%d][1], STDOUT_FILENO);\n", i);
      close(pipes[i][0]);
      printf("close(pipes[%d][0]);\n", i);
      close(pipes[i][1]);
      printf("close(pipes[%d][1]);\n", i);
    }



    FILE *pipe = popen(fullCommand, "r");
    size_t bytesRead = fread(stepBuffer[i], 1, MAX_BUFFER_LENGTH - 1, pipe);
    printf("bytesRead: %zu\n", bytesRead);
    if (bytesRead == 0) {
      fprintf(stderr, "Failed to read output from command '%s'\n", fullCommand);
      return 1;
    }
    stepBuffer[i][bytesRead] = '\0';
    pclose(pipe);
  }

  // Print contents of each temporary buffer with a heading
  // for (int i = 0; i < numSteps; i++) {
  //     printf("Output of command '%s':\n%s\n", stepHeadings[i],
  //     stepBuffer[i]);
  // }

  return 0;
}