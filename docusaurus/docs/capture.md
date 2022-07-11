---
slug: capture
title: Capture Service
---

The network capture service has the purpose of monitoring network traffic for each connected device. It can be configured to execute custom middlewares. The packet capture implements the actual network sniffing process. Currently, it uses the [libpcap library](https://github.com/the-tcpdump-group/libpcap). However, it also allows interfacing with `PF_RING` or similar.

The capture service can be configured with the below options:
```ini
# absolute path to the capture SQLite db used by the middlewares
captureDbPath = "/path_to_capture/capture.sqlite"
# the capture filter for the libpcap library
filter = ""
# libpcap options, see https://www.tcpdump.org/manpages/pcap.3pcap.html
# if true, captures all data on the LAN interface
promiscuous = false
# libpcap buffer timeout in milliseconds
bufferTimeout = 10
# enables libpcap immediate mode if true (disabled buffering)
# see https://www.tcpdump.org/manpages/pcap_set_immediate_mode.3pcap.html
immediate = false
```

# Middlewares

The captured packet is sent to every configured middleware for additional processing. The user has the choice to develop her own middleware. The middleware API is defined in `middleware.h`:
```c
struct capture_middleware {
  struct middleware_context *(*const init)(sqlite3 *db, char *db_path, struct eloop_data *eloop, struct pcap_context *pc);
  int (*const process)(struct middleware_context *context, char *ltype, struct pcap_pkthdr *header, uint8_t *packet, char *ifname);
  void (*const free)(struct middleware_context *context);
  const char *const name;
};
```
Every middleware needs to define three functions `init`, `process` and `free`.

 - The `init` function initialises the middleware, configures the event loop structures and/or creates new tables in the capture database.
 - The `process` function receives as input the captured packets and does the required processing.
 - Finally, the `free` function frees the allocated memory and removes the created tables if needed.

To add a middleware, the user can create a subfolder in the [`src/capture/middlewares` folder](https://github.com/nqminds/edgesec/tree/main/src/capture/middlewares) with the name `example_middleware` and add the main include file `example_middleware.h` with the contents:
```c
#ifndef EXAMPLE_MIDDLEWARE_H
#define EXAMPLE_MIDDLEWARE_H

#include "../../middleware.h"

extern struct capture_middleware example_middleware;
#endif
```
and the main source file `example_middleware.c` with the contents:
```c
#include <sqlite3.h>
#include <libgen.h>

#include "../../capture_service.h"
#include "../../capture_config.h"

#include "../../../utils/allocs.h"
#include "../../../utils/os.h"

#include "../../../utils/eloop.h"
#include "../../../utils/utarray.h"

#include "./example_middleware.h"

struct example_middleware_context {
  // Your context definition
};

void free_example_middleware(struct middleware_context *context)
{
  // Your code here
}

struct middleware_context *init_example_middleware(sqlite3 *db, char *db_path,
                                                   struct eloop_data *eloop,
                                                   struct pcap_context *pc)
{
  struct middleware_context *context = os_zalloc(sizeof(struct middleware_context));

  if (context == NULL) {
    log_errno("zalloc");
    return NULL;
  }

  struct example_middleware_context *example_context = os_zalloc(sizeof(struct example_middleware_context));
  if (example_context == NULL) {
    log_errno("zalloc");
    free_example_middleware(context);
    return NULL;
  }

  context->db = db;
  context->eloop = eloop;
  context->pc = pc;
  context->mdata = (void *) example_context;

  // Your code here

  return context;
}

int process_example_middleware(struct middleware_context *context, char *ltype,
                               struct pcap_pkthdr *header, uint8_t *packet,
                               char *ifname)
{
  // Your code here
}

struct capture_middleware example_middleware = {
    .init = init_example_middleware,
    .process = process_example_middleware,
    .free = free_example_middleware,
    .name = "example middleware",
};
```
Then the user needs to add the option `option(USE_EXAMPLE_MIDDLEWARE "Use the example middleware" ON)` in the root `CMakeLists.txt` and subsequently add the lines:
```cmake
# write your CMakeLists.txt file to compile your middleware
add_subdirectory(./middlewares/example_middleware)
if (USE_EXAMPLE_MIDDLEWARE)
  edgesecAddCaptureMiddleware(MIDDLEWARE_TARGET example_middleware MIDDLEWARE_STRUCT example_middleware)
endif ()
```
in `capture/CMakeLists.txt`.

The capture middleware will execute every defined middleware sequentially. First, it will execute the `init` functions. Then for every packet it will execute all `process` functions and finally, it will run every `free` function.