Object.assign(QUIZZES, {

  'ch95': {
    title: 'Chapter 95 Quiz: Zero-Cost Abstractions',
    questions: [
      {
        q: 'What is the core principle behind "zero-cost abstractions" as Bjarne Stroustrup phrased it?',
        options: [
          'Every abstraction in the language is allocated on the stack instead of the heap',
          'You do not pay for what you do not use, and what you do use compiles to code as good as a hand-written version',
          'All abstractions are eliminated by the linker before the program runs',
          'Abstractions are free only when they are marked with #[inline(always)]'
        ],
        answer: 1,
        explanation: 'Stroustrup\'s formulation, adopted by Rust, says unused features cost nothing and used features could not be hand-coded any better.'
      },
      {
        q: 'Why does an iterator chain like data.iter().map(|x| x*x).sum() typically run as fast as a manual for loop in Rust?',
        options: [
          'Because the standard library uses unsafe code internally to bypass safety checks',
          'Because iterators run on a separate thread by default',
          'Because iterators are lazy and the compiler fuses the chained steps and inlines them into a single tight loop',
          'Because the compiler converts iterators into SIMD code automatically'
        ],
        answer: 2,
        explanation: 'Iterators are lazy and the optimizer can inline and fuse map/sum/etc. into one loop, producing the same machine code as a manual loop.'
      },
      {
        q: 'Which of these abstractions has runtime cost that is NOT zero?',
        options: [
          'A generic function called with a single concrete type',
          'Option<&T> (an Option holding a reference)',
          'A method call through a Box<dyn Trait> trait object',
          'A closure that captures nothing from its environment'
        ],
        answer: 2,
        explanation: 'Trait objects use a vtable, so each method call goes through an indirect pointer lookup that prevents inlining and adds a small cost.'
      },
      {
        q: 'What does monomorphization mean for generic code in Rust?',
        options: [
          'The compiler generates one shared function that uses runtime type information',
          'The compiler refuses to compile generics that are used with more than one type',
          'The compiler generates a separate specialized version of the function for each concrete type used',
          'The compiler converts generics into trait objects automatically'
        ],
        answer: 2,
        explanation: 'Each concrete instantiation of a generic produces a separately compiled specialized function, so calls have no runtime type-dispatch cost.'
      },
      {
        q: 'Why does Option<&u32> take the same number of bytes as &u32 in Rust?',
        options: [
          'Because Option is a special compiler primitive without a discriminant',
          'Because references can never be null, so the compiler uses the all-zero pattern as None (niche optimization)',
          'Because the compiler always packs Option into the same word as its payload by truncating',
          'Because Option<T> is implemented with a global hash table indexed by T'
        ],
        answer: 1,
        explanation: 'References are guaranteed non-null in safe Rust, so the compiler uses zero as the None discriminant without needing extra bytes.'
      }
    ]
  },

  'ch96': {
    title: 'Chapter 96 Quiz: Memory Layout',
    questions: [
      {
        q: 'What does std::mem::size_of::<T>() return?',
        options: [
          'The number of fields in T',
          'The number of bytes a value of type T occupies in memory, including any padding',
          'The size of the T type definition in source bytes',
          'The number of bytes T allocates on the heap'
        ],
        answer: 1,
        explanation: 'size_of returns the in-memory size of a value of T, accounting for the padding the compiler inserts to satisfy alignment.'
      },
      {
        q: 'Why might a struct with fields { a: u8, b: u32, c: u8 } take 12 bytes under #[repr(C)] instead of 6?',
        options: [
          'Because every field is reference-counted',
          'Because u8 is implemented as a 32-bit integer internally',
          'Because the compiler inserts padding to align b to a 4-byte boundary and pads the struct to a multiple of its alignment',
          'Because #[repr(C)] always doubles the size for safety'
        ],
        answer: 2,
        explanation: 'Alignment requirements force padding before b and at the end so the struct length is a multiple of its largest alignment.'
      },
      {
        q: 'When is #[repr(C)] required rather than the default Rust layout?',
        options: [
          'Whenever a struct has more than three fields',
          'When you pass the struct across an FFI boundary to C/C++ code that expects a fixed layout',
          'Only when the struct contains pointers',
          'When you want the compiler to reorder fields for size'
        ],
        answer: 1,
        explanation: 'The default Rust layout may reorder fields. For FFI you need #[repr(C)] so the layout matches what the C side expects.'
      },
      {
        q: 'What is the danger of taking a reference to a field of a #[repr(packed)] struct?',
        options: [
          'It always causes a compile error',
          'It is undefined behavior because the field may be misaligned, even though the read by value is safe',
          'It silently truncates the field to one byte',
          'It allocates the field on the heap'
        ],
        answer: 1,
        explanation: 'Packed fields can be misaligned; references to misaligned data are UB. Reading by value (a copy) is safe.'
      },
      {
        q: 'When you control the layout with #[repr(C)], what field ordering tends to minimize padding?',
        options: [
          'Alphabetical by field name',
          'In the order the fields were originally written',
          'Smallest-aligned fields first',
          'Largest-aligned fields first, then progressively smaller-aligned fields'
        ],
        answer: 3,
        explanation: 'Putting larger-aligned fields first packs smaller-aligned fields into what would otherwise be padding, minimizing total size.'
      }
    ]
  },

  'ch97': {
    title: 'Chapter 97 Quiz: Cache Locality',
    questions: [
      {
        q: 'What is a cache line, and why does it matter?',
        options: [
          'A line of source code the compiler caches; it controls compilation speed',
          'A fixed-size block (typically 64 bytes) the CPU loads from RAM in one go; reading one byte brings in the whole line',
          'A line in the OS scheduler queue; it controls thread switching',
          'A queue inside a Mutex; it controls fairness of locks'
        ],
        answer: 1,
        explanation: 'Memory is fetched in cache-line-sized blocks (typically 64 bytes), so accessing nearby memory is essentially free after the first byte.'
      },
      {
        q: 'Even though both LinkedList and Vec iteration are O(n), why does Vec usually iterate faster?',
        options: [
          'Vec uses SIMD by default and LinkedList does not',
          'Vec stores elements contiguously so the cache prefetcher works well, while LinkedList nodes can live anywhere on the heap',
          'LinkedList iteration is actually O(n^2)',
          'Vec is implemented in unsafe code and skips bounds checks'
        ],
        answer: 1,
        explanation: 'Contiguous Vec storage is cache-friendly and predictable for the prefetcher; LinkedList nodes are scattered and each next pointer can miss the cache.'
      },
      {
        q: 'You have one million particles and a hot loop that only reads each particle\'s x coordinate. Which layout typically gives the best cache behavior for this loop?',
        options: [
          'An Array of Structs where each struct holds x, y, z, mass, color',
          'A Struct of Arrays with separate Vec<f32> for x, y, z, mass and a Vec<[u8;4]> for color',
          'A LinkedList of structs',
          'A HashMap<u32, Particle>'
        ],
        answer: 1,
        explanation: 'SoA lets the loop touch only the x array, so each cache line carries 16 useful x values instead of one x plus unused fields.'
      },
      {
        q: 'What is a "cache miss"?',
        options: [
          'When the OS swaps a page out to disk',
          'When the CPU needs data that is not in any cache and has to fetch it from main memory, paying the full RAM access cost',
          'When the cargo cache directory cannot find a downloaded crate',
          'When a HashMap returns None for a lookup'
        ],
        answer: 1,
        explanation: 'A cache miss is when requested data is absent from L1/L2/L3, forcing a slow round trip to RAM.'
      },
      {
        q: 'Which strategy makes a tight inner loop more cache-friendly?',
        options: [
          'Replacing Vec<T> with Vec<Box<T>> so each item has its own allocation',
          'Splitting one big struct so the field touched in the loop lives in a contiguous Vec by itself',
          'Using LinkedList so insertion in the middle is O(1)',
          'Marking the struct #[repr(packed)] to disable padding'
        ],
        answer: 1,
        explanation: 'Pulling the hot field into its own contiguous Vec maximizes cache-line utilization for that loop. Box-per-element scatters allocations and hurts locality.'
      }
    ]
  },

  'ch98': {
    title: 'Chapter 98 Quiz: Benchmarking',
    questions: [
      {
        q: 'Why must you benchmark with --release rather than the default cargo run?',
        options: [
          'Because debug builds run on a different CPU than release builds',
          'Because debug builds have optimizations disabled and debug assertions enabled, so they are 10-100 times slower and exercise different code',
          'Because cargo run uses an interpreter and cargo build does not',
          'Because debug builds always allocate on the heap and release builds always allocate on the stack'
        ],
        answer: 1,
        explanation: 'Debug builds turn off optimization and turn on extra checks; their numbers do not predict release performance at all.'
      },
      {
        q: 'What is the purpose of std::hint::black_box(value)?',
        options: [
          'It runs the value through a cryptographic hash to make timing deterministic',
          'It is a no-op at runtime but tells the optimizer it cannot reason about the value, preventing it from deleting code as dead',
          'It records the value to a logfile for later analysis',
          'It pins the value to a specific CPU core to avoid scheduling noise'
        ],
        answer: 1,
        explanation: 'black_box opaquely sinks the value so the optimizer cannot prove it is unused and delete the surrounding work.'
      },
      {
        q: 'What is the standard third-party benchmarking crate in the Rust ecosystem on stable?',
        options: [
          'rust-bench',
          'criterion',
          'std::test',
          'tokio-bench'
        ],
        answer: 1,
        explanation: 'criterion is the de facto standard on stable Rust, providing statistical analysis, regression detection, and good defaults.'
      },
      {
        q: 'Why is running a benchmark for many iterations and computing a mean better than timing one run?',
        options: [
          'Because the OS only schedules your program every other run',
          'Because cache state, CPU frequency scaling, OS interruptions, and other noise dominate any single very-fast run',
          'Because Rust always discards the first iteration of any function',
          'Because std::time::Instant only has millisecond resolution'
        ],
        answer: 1,
        explanation: 'A single short run is mostly noise; many iterations average out scheduling jitter, caches warming up, and CPU frequency changes.'
      },
      {
        q: 'You wrote let _ = expensive_function(42); inside a loop you are timing, and the loop reports zero nanoseconds. What likely happened?',
        options: [
          'The function is actually that fast',
          'Rust\'s test harness automatically optimizes loops to a single call',
          'The optimizer proved the result was unused and deleted the call entirely; you should wrap inputs and outputs in black_box',
          'Instant::now() is broken in release builds'
        ],
        answer: 2,
        explanation: 'Without black_box, the optimizer can see the result is discarded and remove the call, leaving you measuring nothing.'
      }
    ]
  },

  'ch99': {
    title: 'Chapter 99 Quiz: Profiling (Flamegraph)',
    questions: [
      {
        q: 'What does the WIDTH of a box in a flamegraph represent?',
        options: [
          'The number of times the function was called',
          'The percentage of sampled call stacks that contained that function (effectively how much CPU time the function consumed)',
          'The number of source lines in the function',
          'The size of the function in bytes'
        ],
        answer: 1,
        explanation: 'Width is the share of samples that included this function, which approximates the share of CPU time spent in or below it.'
      },
      {
        q: 'How does a sampling profiler work?',
        options: [
          'It rewrites every function to count entries and exits',
          'It periodically interrupts the program (for example 1000 times per second) and records the current call stack; functions that appear in more samples consumed more time',
          'It runs the program in a virtual machine and counts every instruction',
          'It uses a debugger to single-step through every line'
        ],
        answer: 1,
        explanation: 'Sampling profilers take periodic stack snapshots; statistically, slow functions appear in more samples. Overhead is low.'
      },
      {
        q: 'You want to profile a release build. What setting in Cargo.toml do you typically enable so functions show up with their real names instead of stripped addresses?',
        options: [
          'opt-level = 0',
          'debug = true under [profile.release]',
          'panic = "abort"',
          'codegen-units = 16'
        ],
        answer: 1,
        explanation: 'Setting debug = true in the release profile keeps DWARF symbols so the profiler can name functions, without slowing the binary.'
      },
      {
        q: 'Your flamegraph shows that most time is in __rust_alloc and memcpy. What is usually the right next step?',
        options: [
          'Rewrite memcpy in assembly to make it faster',
          'Look at the CALLERS of the allocator and figure out which code is allocating so much, then reduce or pool those allocations',
          'Disable the global allocator',
          'Switch to an interpreted language'
        ],
        answer: 1,
        explanation: 'The fix is at the call site, not in the allocator. A wide allocation/memcpy box almost always means too many or too large allocations from above.'
      },
      {
        q: 'Which of the following is a real risk when profiling without a representative workload?',
        options: [
          'The profiler will refuse to run',
          'The flamegraph will show startup costs (config loading, file opening) instead of the hot path you actually care about, leading you to optimize the wrong thing',
          'The optimizer will silently downgrade the binary to debug mode',
          'The OS will mark the process as malware'
        ],
        answer: 1,
        explanation: 'Profiling tiny inputs makes startup dominate; you must run with realistic data so the profile reflects production behavior.'
      }
    ]
  },

  'ch100': {
    title: 'Chapter 100 Quiz: Optimization Strategies',
    questions: [
      {
        q: 'What should the FIRST step of an optimization session always be?',
        options: [
          'Add #[inline(always)] to every function',
          'Switch to unsafe code where possible',
          'Define a measurable goal and benchmark the current state so you have a baseline number to compare against',
          'Rewrite the slow part in C and call it through FFI'
        ],
        answer: 2,
        explanation: 'Without a measurable goal and a baseline, you cannot tell whether your changes helped, hurt, or did nothing.'
      },
      {
        q: 'Which of these is usually the BIGGEST performance win when a program is slow?',
        options: [
          'Replacing #[inline] with #[inline(always)]',
          'Switching from O(n^2) to O(n log n) by choosing a better algorithm or data structure',
          'Renaming variables to be shorter',
          'Increasing codegen-units in Cargo.toml'
        ],
        answer: 1,
        explanation: 'Algorithmic improvements scale with input size and dwarf any micro-optimization. Always look at Big-O before tuning.'
      },
      {
        q: 'You have a hot loop that pushes one million items into a Vec one at a time. What is a simple, low-risk speedup?',
        options: [
          'Wrap each item in a Box',
          'Switch the Vec to a LinkedList',
          'Pre-size the Vec with Vec::with_capacity(1_000_000) so it does not reallocate as it grows',
          'Mark the loop with #[inline(always)]'
        ],
        answer: 2,
        explanation: 'with_capacity reserves the memory once, avoiding several doubling reallocations as the Vec grows.'
      },
      {
        q: 'What does setting lto = "fat" in [profile.release] do?',
        options: [
          'It removes all debug symbols from the binary',
          'It enables link-time optimization across all crates, allowing the optimizer to inline and specialize across crate boundaries at the cost of slower compile time',
          'It increases the stack size of every thread',
          'It forces all functions to be marked #[inline]'
        ],
        answer: 1,
        explanation: 'Link-time optimization runs after all crates are compiled, letting the optimizer see and inline across the whole program for a faster final binary.'
      },
      {
        q: 'Why is "change one thing at a time, then re-measure" a key rule of optimization?',
        options: [
          'Because the borrow checker only accepts one change per commit',
          'Because cargo refuses to compile multi-change diffs in release mode',
          'Because if you change several things at once and the program gets faster, you do not know which change helped, and one change might secretly be making things slower',
          'Because every optimization in Rust requires its own feature gate'
        ],
        answer: 2,
        explanation: 'Changing many things at once destroys your ability to attribute the speedup. Single-change cycles let you keep the wins and revert the duds.'
      }
    ]
  }

});
