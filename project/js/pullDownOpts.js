var PullDownOpts = function (args) {
    console.log(args.pullDownElementId);

    var pullDownElement = document.getElementById(args.pullDownElementId);
    var action = args.action || null;
    var appObj  = (args.application || application) || null;
    var vThreshold = args.vThreshold || 5;

    if (!pullDownElement) { 
        throw new Error ("No element to pull Down");
    }

    this.topOffset = pullDownElement.offsetHeight;
    this.vScrollbar = args.vScrollbar || false;
    


    this.onRefresh =  args.onRefresh || function () {       
        if (pullDownElement.className.match('loading')) {
            pullDownElement.className = '';
            pullDownElement.querySelector('.pullDownLabel').innerHTML = 'Pull down to refresh...';
        } 
    };

    this.onScrollMove = args.onScrollMove || function () {

        if (this.y > vThreshold && ! pullDownElement.className.match('flip')) {
            pullDownElement.className = 'flip';
            pullDownElement.querySelector('.pullDownLabel').innerHTML = 'Release to refresh...';
            this.minScrollY = 0;
        } 
    };

    this.onScrollEnd = args.onScrollEnd || function () {

        if (pullDownElement.className.match('flip')) {
            pullDownElement.className = 'loading';
            pullDownElement.querySelector('.pullDownLabel').innerHTML = 'Loading...';
            
            if (action && appObj) {
                action.apply(appObj);
                // Execute custom function (ajax call?)
            } else {
                throw new Error("No Action or application defined");
            }
        } 
    };


}