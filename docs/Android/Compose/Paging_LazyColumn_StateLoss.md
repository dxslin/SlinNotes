# Jetpack Compose使用Paging3加载数据到LazyColumn，页面跳转后状态丢失问题



### 一、问题描述：

> 代码如下，在TestScreen页面使用Paging加载数据到LazyColumn中，并且额外显示了一个Header；点击Item跳转到其他页面之后再返回，LazyColumn又回到了顶部，无法保持原有滚动的Offset；如果不添加Header的话，却不会出现这个问题。

```kotlin
@Composable
fun TestScreen(
    onItemClick: (ArticleBean) -> Unit
) {
    val testViewModel: TestViewModel = viewModel()
    val items = testViewModel.testArticleFlow.collectAsLazyPagingItems()
    val listState = rememberLazyListState()
    LazyColumn(
        modifier = Modifier.fillMaxWidth(),
        state = listState
    ) {
        logd { "firstVisibleItemIndex=${listState.firstVisibleItemIndex} itemCount=${items.itemCount}" }
        // 添加Header，如果不添加其他的Item项不会出现问题
        item { Text(text = "Header") }
        itemsIndexed(items) { index, item ->
            item?.let {
                ArticleItem(articleBean = item, onItemClick = onItemClick)
            }
        }
    }
}
```



### 二、原因分析：

![image-20210917154852502](https://raw.githubusercontent.com/dxslin/SlinNotes/main/docs/assets/img/compose_paging_lazy_column_state.png)

打印collectAsLazyPagingItems返回的数据items的itemCount发现，跳转页面之后返回，itemCount变为了0，然后又重新加载数据，重新赋值给LazyColumn。

跟踪发现如果LazyColumn的数据项为空，其不会重新绘制；但是如果因为我们添加了一个Header，这时其默认拥有一个Item项，当Paging数据为空时，依然重新绘制了LazyColumn，同时更新了listState的firstVisibleItemIndex，所以页面滚动到了最上面，后面数据出来，依然保留了原有的显示位置。



### 三、解决方案：

##### 方向1

> 当数据为空的时候，不绘制LazyColumn

具体实践：

1. 将Header移除列表，列表只处理Paging数据
2. 



##### 方向2

> 延长paging数据存在周期，返回页面时不再重新加载，而是直接使用之前的数据项。

具体实践：

1. 在NavHost外面获取collectAsLazyPagingItems数据项，然后依次传入方法内部，但是这样延长了ViewModel存在的生命周期，不建议使用。
2. 尝试在ViewModel中缓存Flow数据
3. 



