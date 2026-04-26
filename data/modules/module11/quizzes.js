Object.assign(QUIZZES, {
  'ch70': {
    title: 'Chapter 70 Quiz: Threads',
    questions: [
      {
        q: 'What does `thread::spawn` return in Rust?',
        options: [
          'A raw OS thread handle',
          'A `JoinHandle<T>` where T is the return type of the closure',
          'A `Result<Thread, Error>`',
          'Nothing — the thread runs detached by default'
        ],
        answer: 1,
        explanation: '`thread::spawn` returns a `JoinHandle<T>`, which lets you call `.join()` to wait for the thread and retrieve its return value.'
      },
      {
        q: 'Why must closures passed to `thread::spawn` often use the `move` keyword?',
        options: [
          'To make the closure run faster by avoiding indirection',
          'Because the compiler requires it for all closures',
          'To transfer ownership of captured variables into the thread, satisfying lifetime requirements',
          'To allow the closure to mutate global variables'
        ],
        answer: 2,
        explanation: 'The spawned thread may outlive the scope where the closure was created, so `move` transfers ownership of captured data into the thread, preventing dangling references.'
      },
      {
        q: 'What happens if you drop a `JoinHandle` without calling `.join()`?',
        options: [
          'The thread is immediately killed',
          'A panic occurs in the main thread',
          'The thread continues running independently and is detached',
          'A compile error occurs'
        ],
        answer: 2,
        explanation: 'Dropping a `JoinHandle` without joining detaches the thread. The thread continues running, but you lose the ability to retrieve its result or wait for it.'
      },
      {
        q: 'What does `.join()` return if the spawned thread panicked?',
        options: [
          'It propagates the panic to the calling thread immediately',
          'It returns `Err(Box<dyn Any + Send>)` containing the panic value',
          'It returns `None`',
          'It returns `Ok(())` regardless of panic'
        ],
        answer: 1,
        explanation: '`.join()` returns a `Result`. If the thread panicked, the result is `Err(...)` containing the panic payload, allowing the caller to handle or re-panic it.'
      },
      {
        q: 'If you spawn two threads that both print numbers, which of the following is guaranteed about their output order?',
        options: [
          'Thread 1 always prints before Thread 2',
          'Thread 2 always prints before Thread 1',
          'The order is non-deterministic and depends on OS scheduling',
          'They always interleave perfectly, alternating one number at a time'
        ],
        answer: 2,
        explanation: 'Thread scheduling is controlled by the OS. Without explicit synchronization, the interleaving of output from two threads is non-deterministic.'
      }
    ]
  },

  'ch71': {
    title: 'Chapter 71 Quiz: Channels',
    questions: [
      {
        q: 'What does `mpsc` stand for in `std::sync::mpsc`?',
        options: [
          'Multi-producer, single-consumer',
          'Multi-process, single-core',
          'Message-passing, synchronous channel',
          'Mutex-protected, safe channel'
        ],
        answer: 0,
        explanation: '`mpsc` stands for "multiple producer, single consumer" — many senders can clone the `tx` end, but only one receiver holds the `rx` end.'
      },
      {
        q: 'What happens when you call `rx.recv()` and all senders have been dropped?',
        options: [
          'It blocks forever waiting for a sender to appear',
          'It panics with a "channel closed" message',
          'It returns `Err(RecvError)`, signaling the channel is disconnected',
          'It returns `Ok(None)` to indicate no more data'
        ],
        answer: 2,
        explanation: 'When all `tx` clones are dropped, the channel is disconnected. `rx.recv()` returns `Err(RecvError)`, which is how you detect that no more messages will arrive.'
      },
      {
        q: 'How do you create multiple producers from a single `mpsc` channel?',
        options: [
          'By calling `mpsc::channel()` multiple times',
          'By cloning the receiver (`rx.clone()`)',
          'By cloning the sender (`tx.clone()`)',
          'Multiple producers are not supported — use a different channel type'
        ],
        answer: 2,
        explanation: 'The sender (`tx`) implements `Clone`. Each clone is an independent sender that routes messages to the same receiver.'
      },
      {
        q: 'What is the difference between `rx.recv()` and `rx.try_recv()`?',
        options: [
          '`recv()` is for strings, `try_recv()` is for any type',
          '`recv()` blocks until a message arrives; `try_recv()` returns immediately with `Err` if no message is ready',
          '`recv()` can only be called once; `try_recv()` can be called repeatedly',
          'There is no difference — they are aliases'
        ],
        answer: 1,
        explanation: '`recv()` is blocking and sleeps the thread until a message arrives. `try_recv()` is non-blocking and returns `Err(TryRecvError::Empty)` if the channel is currently empty.'
      },
      {
        q: 'In Rust\'s ownership model, what happens to the value after you call `tx.send(value)`?',
        options: [
          'The value is copied into the channel; the original is still usable',
          'The value is moved into the channel; the sender can no longer use it',
          'The value is borrowed; ownership returns after the receiver reads it',
          'The value is cloned automatically if it implements Clone'
        ],
        answer: 1,
        explanation: '`send()` takes ownership of the value, moving it into the channel. This is what makes channels memory-safe — only one owner (the receiver) holds the data at any time.'
      }
    ]
  },

  'ch72': {
    title: 'Chapter 72 Quiz: Mutex & RwLock',
    questions: [
      {
        q: 'Why is `Arc<Mutex<T>>` the standard pattern for sharing mutable data across threads, rather than just `Mutex<T>`?',
        options: [
          'Because `Mutex<T>` is not thread-safe on its own',
          'Because `Arc` provides reference counting so multiple threads can own the same `Mutex`',
          'Because `Mutex<T>` requires a heap allocation that only `Arc` can provide',
          'Because `Arc` automatically unlocks the `Mutex` when it goes out of scope'
        ],
        answer: 1,
        explanation: '`Arc` (atomic reference counting) allows multiple threads to share ownership of the same value. Without it, you could not give each thread its own handle to the same `Mutex`.'
      },
      {
        q: 'What does `mutex.lock()` return, and when is the lock released?',
        options: [
          'A `bool` indicating success; you call `mutex.unlock()` manually to release',
          'A `MutexGuard<T>`; the lock is released when the guard goes out of scope (RAII)',
          'A `&mut T`; the lock is released when the reference expires',
          'A `Result<T, Error>`; the lock is released after the Result is consumed'
        ],
        answer: 1,
        explanation: '`lock()` returns a `MutexGuard<T>`, which implements `Deref` to give access to the inner data. When the guard is dropped, the lock is automatically released via RAII.'
      },
      {
        q: 'What is a "poisoned" Mutex in Rust?',
        options: [
          'A Mutex that has been locked for too long and timed out',
          'A Mutex whose inner data was mutated by an unauthorized thread',
          'A Mutex where the locking thread panicked while holding the lock',
          'A Mutex that was created with invalid parameters'
        ],
        answer: 2,
        explanation: 'If a thread panics while holding a `Mutex` lock, the mutex becomes "poisoned". Subsequent `lock()` calls return `Err(PoisonError)` to warn other threads that the data may be in an inconsistent state.'
      },
      {
        q: 'When should you prefer `RwLock` over `Mutex`?',
        options: [
          'When only one thread ever accesses the data',
          'When reads are frequent and writes are rare, to allow concurrent reads',
          'When writes are frequent, because `RwLock` is always faster than `Mutex`',
          'When you need to share the lock across processes, not just threads'
        ],
        answer: 1,
        explanation: '`RwLock` allows multiple concurrent readers OR one exclusive writer. It is most beneficial when reads vastly outnumber writes, as readers no longer block each other.'
      },
      {
        q: 'Which of these correctly acquires a write lock using `RwLock`?',
        options: [
          '`let val = rwlock.lock().unwrap();`',
          '`let val = rwlock.write().unwrap();`',
          '`let val = rwlock.acquire_write().unwrap();`',
          '`let val = rwlock.exclusive().unwrap();`'
        ],
        answer: 1,
        explanation: '`RwLock` provides `.read()` for shared read access and `.write()` for exclusive write access. The `.lock()` method belongs to `Mutex`, not `RwLock`.'
      }
    ]
  },

  'ch73': {
    title: 'Chapter 73 Quiz: Deadlocks',
    questions: [
      {
        q: 'Which of the following is NOT one of the four necessary conditions for a deadlock?',
        options: [
          'Mutual exclusion — only one thread can hold a resource at a time',
          'Hold and wait — a thread holds a resource while waiting for another',
          'Starvation — a low-priority thread never gets CPU time',
          'Circular wait — Thread A waits for Thread B, which waits for Thread A'
        ],
        answer: 2,
        explanation: 'Starvation is a separate concurrency problem (a thread never progresses). The four deadlock conditions are: mutual exclusion, hold-and-wait, no preemption, and circular wait.'
      },
      {
        q: 'What is the most common strategy for preventing deadlocks when multiple locks are needed?',
        options: [
          'Always use `try_lock()` instead of `lock()` for all locks',
          'Acquire all locks in a consistent global ordering across all threads',
          'Use a single global `Mutex` that wraps all shared data',
          'Release all locks before sleeping, then re-acquire them after'
        ],
        answer: 1,
        explanation: 'Consistent lock ordering eliminates circular wait. If all threads always acquire Lock A before Lock B, no thread can be waiting for A while holding B.'
      },
      {
        q: 'What does `mutex.try_lock()` return if the lock is already held by another thread?',
        options: [
          'It blocks until the lock is available, same as `lock()`',
          'It panics with a "lock contention" error',
          'It returns `Err(TryLockError::WouldBlock)` immediately',
          'It returns `Ok(None)` to indicate the lock was unavailable'
        ],
        answer: 2,
        explanation: '`try_lock()` is non-blocking. If the lock is held, it returns `Err(TryLockError::WouldBlock)` immediately, letting the caller decide what to do next rather than sleeping.'
      },
      {
        q: 'Does Rust\'s type system prevent deadlocks at compile time?',
        options: [
          'Yes — the borrow checker detects circular lock dependencies',
          'Yes — `Send` and `Sync` bounds prevent deadlock scenarios entirely',
          'No — deadlocks are a logical error that the type system cannot catch',
          'No — but the standard library runtime detects and panics on deadlock'
        ],
        answer: 2,
        explanation: 'Rust\'s type system guarantees memory safety and data-race freedom, but deadlocks are a logical concurrency bug. No static analysis in stable Rust can fully prevent them.'
      },
      {
        q: 'A thread calls `mutex.lock()` while it is already holding a lock on the same `Mutex`. What happens?',
        options: [
          'The second lock succeeds because Rust\'s `Mutex` is re-entrant',
          'The thread deadlocks — it waits for itself to release a lock it will never release',
          'A compile error occurs because double-locking is detected statically',
          'The first lock is automatically released before the second is acquired'
        ],
        answer: 1,
        explanation: 'Rust\'s standard `Mutex` is NOT re-entrant. A thread that tries to lock a `Mutex` it already holds will deadlock, waiting forever for a lock release that can never happen.'
      }
    ]
  },

  'ch74': {
    title: 'Chapter 74 Quiz: Atomics',
    questions: [
      {
        q: 'What is the key advantage of atomic operations over using a `Mutex`?',
        options: [
          'Atomics can store any type, including structs and strings',
          'Atomics perform their read-modify-write as a single, uninterruptible hardware instruction without locking',
          'Atomics are always faster regardless of the situation',
          'Atomics work across processes, not just threads'
        ],
        answer: 1,
        explanation: 'Atomic operations are hardware-supported single-instruction operations. They avoid the overhead of acquiring and releasing a lock, making them faster for simple counter or flag scenarios.'
      },
      {
        q: 'What does `Ordering::SeqCst` guarantee compared to `Ordering::Relaxed`?',
        options: [
          '`SeqCst` is faster because it allows the CPU to reorder operations freely',
          '`SeqCst` establishes a single total order of all atomic operations seen by all threads',
          '`SeqCst` only applies to store operations, while `Relaxed` applies to loads',
          '`Relaxed` provides stronger guarantees for cross-thread visibility'
        ],
        answer: 1,
        explanation: '`SeqCst` (Sequentially Consistent) is the strongest ordering: all threads observe all `SeqCst` operations in the same global order. `Relaxed` allows reordering and is only safe for independent counters where ordering relative to other operations doesn\'t matter.'
      },
      {
        q: 'Which method would you use to safely increment an `AtomicUsize` counter from multiple threads?',
        options: [
          '`counter.store(counter.load(Ordering::SeqCst) + 1, Ordering::SeqCst)`',
          '`counter += 1`',
          '`counter.fetch_add(1, Ordering::SeqCst)`',
          '`counter.set(counter.get() + 1)`'
        ],
        answer: 2,
        explanation: '`fetch_add` atomically adds a value and returns the previous value, all as one hardware instruction. The separate load-then-store approach has a race condition between the two operations.'
      },
      {
        q: 'What does `compare_exchange(current, new, success_ord, failure_ord)` do?',
        options: [
          'It always stores `new` and returns whether the old value equaled `current`',
          'It stores `new` only if the current value equals `current`, returning `Ok(old)` on success or `Err(actual)` on failure',
          'It compares two atomic variables and exchanges their values',
          'It reads the current value and stores `new` in two separate atomic operations'
        ],
        answer: 1,
        explanation: '`compare_exchange` is the CAS (Compare-And-Swap) primitive: it atomically checks if the value equals `current` and, only if so, replaces it with `new`. This is the foundation of lock-free algorithms.'
      },
      {
        q: 'Why are atomic types restricted to primitive types like `usize`, `bool`, and `u32` rather than arbitrary structs?',
        options: [
          'It is a Rust language limitation that will be removed in a future edition',
          'Hardware CAS instructions only operate on values that fit in a single CPU register or cache line',
          'Structs cannot implement the `Send` trait required for atomics',
          'The standard library team simply hasn\'t added struct support yet'
        ],
        answer: 1,
        explanation: 'Atomic operations rely on hardware instructions (like LOCK CMPXCHG) that operate on fixed-size machine words. Arbitrary structs don\'t fit this model — for complex shared state, you use `Arc<Mutex<T>>`.'
      }
    ]
  },

  'ch75': {
    title: 'Chapter 75 Quiz: Lock-Free Basics',
    questions: [
      {
        q: 'What is the defining characteristic of a lock-free data structure?',
        options: [
          'It uses no heap allocation',
          'It guarantees that at least one thread makes progress in a finite number of steps, even if others stall',
          'It is faster than any mutex-based implementation in all cases',
          'It uses no atomic operations — it avoids all synchronization primitives'
        ],
        answer: 1,
        explanation: 'Lock-free means the system as a whole makes progress even if individual threads are delayed or suspended. A stalled thread cannot hold a "lock" that blocks others from advancing.'
      },
      {
        q: 'In a CAS loop (`compare_exchange` in a `loop`), what should the thread do when CAS fails?',
        options: [
          'Panic — a CAS failure indicates a programming error',
          'Return an error to the caller immediately',
          'Retry the loop: re-read the current value and attempt CAS again',
          'Acquire a mutex to complete the operation safely'
        ],
        answer: 2,
        explanation: 'A CAS failure means another thread updated the value first. The correct response is to re-read the latest value and retry. This retry loop is the fundamental pattern of all lock-free algorithms.'
      },
      {
        q: 'What is the ABA problem in lock-free programming?',
        options: [
          'A thread reads value A, another changes it to B then back to A, so the first thread\'s CAS succeeds even though the state changed in between',
          'Two threads with names starting with A and B both try to write the same value',
          'An atomic operation that returns A when B was expected due to a hardware bug',
          'A deadlock involving exactly two threads, A and B'
        ],
        answer: 0,
        explanation: 'ABA is subtle: Thread 1 reads A, Thread 2 changes A to B and back to A, Thread 1\'s CAS on A succeeds — but the world changed in between and the assumption encoded in the CAS may be invalid.'
      },
      {
        q: 'When is using `Mutex<T>` generally preferable to a lock-free approach with atomics?',
        options: [
          'When the critical section is very short and contains only a single integer increment',
          'When you need to protect complex, multi-field data structures where correctness is paramount',
          'When the code runs in a real-time system where lock acquisition must be instant',
          'When you need maximum throughput on a single-core machine'
        ],
        answer: 1,
        explanation: 'Lock-free code is hard to reason about correctly. For complex shared state (structs with multiple fields), `Mutex` is far easier to write correctly. Use atomics/lock-free only when you have a proven performance bottleneck and simple types.'
      },
      {
        q: 'In a spinlock implementation using atomics, what does the "spin" part refer to?',
        options: [
          'The lock automatically rotates ownership between waiting threads in round-robin order',
          'The thread busy-waits in a loop, repeatedly checking if the lock is free, instead of sleeping',
          'The lock uses spinning hardware registers instead of memory locations',
          'The thread spins up a new OS thread to wait for the lock'
        ],
        answer: 1,
        explanation: 'A spinlock does not put the thread to sleep. It repeatedly polls the atomic flag in a tight loop (busy-waiting). This avoids OS scheduling overhead but wastes CPU cycles if the wait is long.'
      }
    ]
  },

  'ch76': {
    title: 'Chapter 76 Quiz: Fearless Concurrency',
    questions: [
      {
        q: 'What is a "data race" and how does Rust prevent it?',
        options: [
          'Two threads reading the same data simultaneously — Rust prevents it by disallowing shared references',
          'Two threads accessing the same memory where at least one writes and there is no synchronization — Rust prevents it via the `Send` and `Sync` trait system enforced at compile time',
          'A thread writing data faster than another can read it — Rust prevents it with bounded channels',
          'Two threads competing for CPU time — Rust prevents it with the async/await system'
        ],
        answer: 1,
        explanation: 'A data race is concurrent unsynchronized access where at least one operation is a write. Rust\'s `Send`/`Sync` traits, enforced by the borrow checker at compile time, make it impossible to share non-synchronized mutable state across threads.'
      },
      {
        q: 'Which trait marks a type as safe to TRANSFER ownership to another thread?',
        options: [
          '`Sync`',
          '`Send`',
          '`Copy`',
          '`Unpin`'
        ],
        answer: 1,
        explanation: '`Send` means ownership of a value can be transferred to another thread. `Sync` means a shared reference (`&T`) can be sent to another thread. Most types are `Send`; `Rc<T>` is a notable example that is not.'
      },
      {
        q: 'Why is `Rc<T>` not `Send`?',
        options: [
          'Because `Rc<T>` requires heap allocation which is not thread-safe',
          'Because `Rc<T>` uses non-atomic reference counting, so two threads could corrupt the count simultaneously',
          'Because `Rc<T>` stores raw pointers which are never `Send`',
          'Because the `Rc` type has been explicitly excluded by the Rust authors for historical reasons'
        ],
        answer: 1,
        explanation: '`Rc<T>` uses ordinary integer increments/decrements for its reference count. If two threads simultaneously drop an `Rc<T>`, the count update is a data race. `Arc<T>` uses atomic operations instead, making it `Send + Sync`.'
      },
      {
        q: 'Rust guarantees freedom from data races at compile time. Which concurrency problem does it NOT prevent?',
        options: [
          'Using non-`Send` types across threads',
          'Mutating data from two threads without synchronization',
          'Deadlocks caused by acquiring two mutexes in inconsistent order',
          'Sending a non-`Sync` type through a shared reference to another thread'
        ],
        answer: 2,
        explanation: 'Rust\'s type system prevents data races via `Send`/`Sync`. Deadlocks are a logical error (both threads correctly acquire and hold locks) that cannot be detected statically — they remain the programmer\'s responsibility.'
      },
      {
        q: 'Which combination of tools would you choose to send work from one thread to several worker threads, where each worker needs mutable access to a shared result buffer?',
        options: [
          '`Rc<T>` for the buffer and `mpsc::channel` for work distribution',
          '`Arc<Mutex<T>>` for the shared buffer and `mpsc::channel` for distributing work items to workers',
          '`Arc<RwLock<T>>` for the buffer and raw pointers for work distribution',
          'A global `static mut` buffer guarded by an `AtomicBool` flag'
        ],
        answer: 1,
        explanation: '`mpsc::channel` efficiently distributes work items to a pool of workers. `Arc<Mutex<T>>` allows each worker to safely acquire exclusive access to the shared result buffer. This is the canonical thread-pool pattern in Rust.'
      }
    ]
  }
});
