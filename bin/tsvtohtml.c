#include <stdio.h>
#include <stdlib.h>
#include <string.h>

void tsv_to_html() {
  // Generate HTML table
  printf("<table>\n");

  // Read input from stdin
  char buffer[1024];
  while (1) {
    size_t nread = fread(buffer, 1, sizeof(buffer), stdin);
    if (nread == 0) {
      break;
    }

    int last = 0;
    for (int i = 0; i < nread; i++) {
      if (i == 0) {
        printf("  <tr>\n");
      }
      if (buffer[i] == '\t') {
        buffer[i] = '\0';
        printf("    <td>%s</td>\n", &buffer[last]);
        last = i + 1;
      }
      if (buffer[i] == '\n') {
        buffer[i] = '\0';
        printf("    <td>%s</td>\n", &buffer[last]);
        last = i + 1;
        printf("  </tr>\n");
        
        if (i != nread - 1) {
          printf("  <tr>\n");
        }
      }
      fflush(stdout);
    }
  }

  printf("</table>\n");
}

int main() {
  tsv_to_html();
}