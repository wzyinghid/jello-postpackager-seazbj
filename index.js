'use strict';
module.exports = function(ret, settings, conf, opt){ //打包后处理
    console.log(fis.config.get());
    function uniqueArr(arr){
        var n = [arr[0]]; //结果数组
        for(var i = 1; i < arr.length; i++) //从第二项开始遍历
        {
            if (arr.indexOf(arr[i]) == i) n.push(arr[i]);
        }
        return n;
    }
    //找到所有的源码文件，对其进行页面js合并
    var arr1=[];
    var arr2=[];
    var arr;
    fis.util.map(ret.src, function(subpath, file){
        // js且在js/page目录下
        if(file.isJsLike&&/js\/page/.test(subpath)){
            var depenArr=[];
            var depenArr1=[];
            var depenArr2=[];
            //1.获取文本对象
            var content = file.getContent();
            var contentExt = '';
            //有seajs.use
            if(/\bseajs\.use\s*\(/.test(content)){
                //2.获取一级数组
                depenArr=depenArr.concat(file.requires);
                var depenArr1Str=content.match(/seajs.use\(\[([\s\S]*?)\],/)[1];
                depenArr1Str=depenArr1Str.substr(1,depenArr1Str.length).substr(0,depenArr1Str.length-2);
                depenArr1=depenArr1Str.split(/[',"]\s*,\s*[',"]/);
                depenArr=depenArr1;
                //触屏版的依赖关系很浅，只到二级就可以了
                //3.获取二级数组
                // fis.util.map(depenArr1,function(index,widgetName){
                //     fis.util.map(ret.src, function(subpath, file){
                //         var content1 = file.getContent();
                //         if(file.isJsLike&&(/js\/widget/.test(subpath)||/vendor/.test(subpath)||/js\/plugins/.test(subpath))&&!/debug/.test(subpath)&&subpath.indexOf(widgetName)>0){
                //             depenArr=depenArr.concat(file.requires);
                //         }
                //     })
                // })
                //4.获取多级数组
                //i表示遍历深度
                for(var i=0;i<3;i++){
                    fis.util.map(depenArr,function(index,widgetName){
                        fis.util.map(ret.src, function(subpath1, file){
                            // var content1 = file.getContent();
                            if(file.isJsLike&&(/js\/widget/.test(subpath1)||/vendor/.test(subpath1)||/js\/plugins/.test(subpath1))&&!/debug/.test(subpath1)&&subpath1.indexOf(widgetName)>0){
                                depenArr=depenArr.concat(file.requires);
                            }
                        })
                    })
                }
                //4.去除多余文件
                //5.倒叙排列
                depenArr=uniqueArr(depenArr).reverse();
                //6.循环合并
                fis.util.map(depenArr,function(index,widgetName){
                    fis.util.map(ret.src, function(subpath2, file2){
                        //js且在js/widget或vender下
                        var content2 = file2.getContent();
                        if(file.isJsLike&&(/js\/widget/.test(subpath2)||/vendor/.test(subpath2)||/js\/plugins/.test(subpath2))&&!/debug/.test(subpath2)&&subpath2.indexOf(widgetName+'.js')>0){
                            console.log(subpath,subpath2);
                            contentExt+=content2;
                        }
                    })
                })
            }
            //7.SET
            file.setContent(contentExt+content);
        }
    });
};
