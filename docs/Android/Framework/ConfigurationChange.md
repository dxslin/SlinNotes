

```mermaid
graph TB

subgraph 重启Activity流程图
CC([Config Change])
CC --> HRA(handleRelaunchActivity) 
HRA --> HRAI(handleRelaunchActivityInner)
HRAI --> HDA(handleDestroyActivity)
	HDA --> PDA(performDestroyActivity)

HRAI --> HLA(handleLaunchActivity)
	HLA --> PLA(performLaunchActivity)
end
	HRA -.- NOTE_CC["r.activity.mChangingConfigurations = true;"]
	PDA -.- NOTE_LNCI["r.lastNonConfigurationInstances = r.activity.retainNonConfigurationInstances()"]
	PLA -.- NOTE_ATTACH["activity.attach(…, r.lastNonConfigurationInstances, config,…);"]

classDef class_note fill:#FFF5AD,stroke:#333;
class NOTE_LNCI,NOTE_ATTACH,NOTE_CC class_note
```





config change -> ActivityThread.handleRelaunchActivity()	— 	r.activity.mChangingConfigurations = true;  
    -> handleRelaunchActivityInner()
    	-> handleDestroyActivity() 
				-> performDestroyActivity() 	— 	r.lastNonConfigurationInstances = r.activity.retainNonConfigurationInstances();
		-> handleLaunchActivity()
				-> performLaunchActivity()	—	activity.attach(…, r.lastNonConfigurationInstances, config,…);





![img](https://raw.githubusercontent.com/dxslin/SlinNotes/main/docs/assets/img/configuration_change_flow.png)



![image-20210712173946335](https://raw.githubusercontent.com/dxslin/SlinNotes/main/docs/assets/img/image-20210712173946335.png)



![image-20210712174422158](https://raw.githubusercontent.com/dxslin/SlinNotes/main/docs/assets/img/image-20210712174422158.png)

![image-20210712174525940](https://raw.githubusercontent.com/dxslin/SlinNotes/main/docs/assets/img/image-20210712174525940.png)

 如果Configuration发送改变，ActivityThread会收到`EXECUTE_TRANSACTION`消息，然后调用`TransactionExecutor`执行`ConfigurationChangeItem`的

继承ClientTransactionItem的类；

ActivityLifecycleItem	Lifecycle的抽象类；这个后面再细看；
ActivityConfigurationChangeItem	Activity Configuration Changed消息；
ActivityResultItem	Activity Result消息；
ConfigurationChangeItem	App configuration change消息；
MoveToDisplayItem	Activity move to a different display消息；
MultiWindowModeChangeItem	Multi-window mode change消息；
PipModeChangeItem	Picture in picture mode change消息；
WindowVisibilityItem	Window visibility change消息；
NewIntentItem	New intent消息；
ActivityRelaunchItem	Activity relaunch callback消息；
LaunchActivityItem	Request to launch an activity；





### 参考

[Android P ActivityManagerService（七） TransactionExecutor消息机制]:https://blog.csdn.net/weixin_39821531/article/details/89519276





--8<--
uml.txt

mathjax.txt
--8<--

