#include <ctype.h>
#include <stdlib.h>
#include <string.h>
#include <sys/types.h>
#include <unistd.h>

int main(int argc, char *argv[])
{
    setuid(0);

    for (int i = 0; argv[i]; i++)
    {
        for (int b = 0; argv[i][b]; b++)
        {
            argv[i][b] = tolower(argv[i][b]);
        }
    }

    if (argc >= 2 && strcmp(argv[1], "start") == 0)
    {
        system("service [botname] start");
    }
    else if (argc >= 2 && strcmp(argv[1], "stop") == 0)
    {
        system("service [botname] stop");
    }
    else
    {
        system("service [botname] restart");
    }

    return 0;
}
