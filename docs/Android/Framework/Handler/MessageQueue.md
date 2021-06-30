# MessageQueue的next方法详解



```java
 //MessageQueue.java api 29
Message next() {
     	// 如果消息Loop已经退出并被处理，则返回这里。
     	// 如果应用程序在退出后试图重启一个不支持的Looper，则可能发生这种情况。
        final long ptr = mPtr;
        if (ptr == 0) {
            return null;
        }

     	// 保证idleHandler只会执行一次;
     	// 当idleHandler执行一次之后，会被赋值为0，再次执行的时候会判断其是否小于0
        int pendingIdleHandlerCount = -1; 
     	// nativePollOnce方法等待超时时间，-1 表示无限等待，不超时；0 表示立即执行；大于0则表示超时时间
        int nextPollTimeoutMillis = 0;
     	// 无限循环，指导取出消息或者退出；nativePollOnce方法是阻塞的，不会导致ANR
        for (;;) {
            if (nextPollTimeoutMillis != 0) {
                Binder.flushPendingCommands();
            }
		   // 阻塞nextPollTimeoutMillis长的时间，如果nextPollTimeoutMillis为-1，则等待外部唤醒
            nativePollOnce(ptr, nextPollTimeoutMillis);

            synchronized (this) {
                //这里使用的是uptimeMillis方法，记录的是系统自启动以来的时间，是不受调节系统时间影响的，所
                final long now = SystemClock.uptimeMillis();
                Message prevMsg = null;
                // mMessages相当于Message链表的head
                Message msg = mMessages;
                // 如果msg.target为空的话，那么此消息为同步屏障消息，那么就需要先取出链表中的第一个异步消息执行
                if (msg != null && msg.target == null) {
                    do {
                        prevMsg = msg;
                        msg = msg.next;
                    } while (msg != null && !msg.isAsynchronous());
                }
                if (msg != null) {
                    if (now < msg.when) {
                        // 如果当前时间小于msg待执行的时间，表示是延迟消息且还没有到其需要执行的时间，则计算需要等待的时间
                        nextPollTimeoutMillis = (int) Math.min(msg.when - now, Integer.MAX_VALUE);
                    } else {
                        // 如果当前时间大于等于msg待执行时间，表示需要执行该消息
                        // 那么需要将此消息移除链表，并标记为正在使用，返回
                        mBlocked = false;
                        if (prevMsg != null) {
                            prevMsg.next = msg.next;
                        } else {
                            mMessages = msg.next;
                        }
                        msg.next = null;
                        if (DEBUG) Log.v(TAG, "Returning message: " + msg);
                        msg.markInUse();
                        return msg;
                    }
                } else {
                    // 消息链表没有多余的消息，那么需要无限等待，直到外部唤醒（如添加消息）
                    nextPollTimeoutMillis = -1;
                }

                // 所有挂起的消息都已处理，现在处理退出消息。
                if (mQuitting) {
                    dispose();
                    return null;
                }

                // 只有第一次执行时，pendingIdleHandlerCount才会小于0，所以idle只有第一次会执行
                // 并且消息链表为空，或者还没有到消息的执行时间（也可能是一个同步屏障消息）
                if (pendingIdleHandlerCount < 0
                        && (mMessages == null || now < mMessages.when)) {
                    pendingIdleHandlerCount = mIdleHandlers.size();
                }
                if (pendingIdleHandlerCount <= 0) {
                    // No idle handlers to run.  Loop and wait some more.
                    // 如果没有idle handlers需要执行，那么直接等待后续提交消息执行；
                    // 执行到这里，一般分两种情况：一种是没有idle handlers；一种是第一次for循环已经执行了一次idle handlers
                    mBlocked = true;
                    continue;
                }

                if (mPendingIdleHandlers == null) {
                    mPendingIdleHandlers = new IdleHandler[Math.max(pendingIdleHandlerCount, 4)];
                }
                mPendingIdleHandlers = mIdleHandlers.toArray(mPendingIdleHandlers);
            }

            // 开始执行idle handlers
            // 只有第一次for循环，才能到达这里
            for (int i = 0; i < pendingIdleHandlerCount; i++) {
                final IdleHandler idler = mPendingIdleHandlers[i];
                mPendingIdleHandlers[i] = null; // release the reference to the handler

                boolean keep = false;
                try {
                    keep = idler.queueIdle();
                } catch (Throwable t) {
                    Log.wtf(TAG, "IdleHandler threw exception", t);
                }

                if (!keep) {
                    synchronized (this) {
                        mIdleHandlers.remove(idler);
                    }
                }
            }

            // 将空闲处理程序计数重置为0，让idle handlers不再执行；只有pendingIdleHandlerCount小于0时才会再次执行idle handlers
            pendingIdleHandlerCount = 0;

		   // 当调用一个空闲的处理程序时，一个新的消息可能已经被传递
            // 所以返回并再次查找一个挂起的消息，而不是等待。
            nextPollTimeoutMillis = 0;
        }
    }
```

