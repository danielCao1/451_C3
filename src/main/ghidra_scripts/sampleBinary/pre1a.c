#include <stdio.h>
#include <math.h>
#include <string.h>

int main(int argc, char** argv) {
	if (argc == 2) {
		signed int l = strlen(argv[1]);
		printf("%i\n", l);
		signed int hlf = floor(l/2);
		printf("%i\n", hlf);
		printf("%s\n", argv[1]);
		for (int i = 0; i < hlf; i++)
			if (argv[1][i] != argv[1][l-i-1]) {
				printf("%s is not a palidrome.\n", argv[1]);
				return 0;
			}
		printf("%s is a palidrome.\n", argv[1]);
	}
	else
		printf("./pre1a [val]\n");
}