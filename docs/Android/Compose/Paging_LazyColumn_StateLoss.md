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

1. 将Header列表放在列表外面，列表只处理Paging数据，但是Header就无法跟随列表滑动，如果不影响UI的话可以使用；
2. 在itemIndex为0的时候，将数据项和Header同时绘制，但是Header只能有数据的时候才会显示；
3. 在1的基础上面自定义布局，有数据时绘制正常的LazyList，无数据时，直接显示Banner，实现逻辑较为复杂；



##### 方向2

> 延长LazyPagingItems数据存在生命周期，返回页面时不再重新加载，而是直接使用之前的数据项。

具体实践：

1. 在NavHost外面获取collectAsLazyPagingItems数据项，然后依次传入方法内部，但是这样延长了ViewModel存在的生命周期，而且每次都要传该对象，很麻烦，不建议使用；
2. 将collectAsLazyPagingItems返回的LazyPagingItems数据项缓存到ViewModel，取数据时优先取ViewModel中的数据项，为空时再使用collectAsLazyPagingItems生成。这种方式既可以节省网络请求，又可以完美解决上面的问题，但是因为延长了LazyPagingItems的生命周期，需要在ViewModel的onClear中清除，避免内存泄漏。



最终方案使用方向1方案3，自己重新组合List来达到想要的效果，详细代码请参考：

[RefreshPageList](https://github.com/dxslin/ComposeStudy/blob/master/SPlayAndroid/src/main/java/com/slin/splayandroid/widget/RefreshPageList.kt)

