

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







--8<--
uml.txt

mathjax.txt
--8<--

