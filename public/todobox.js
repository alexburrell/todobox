var client = new Dropbox.Client({
    key: 'f6xdhvlnuyb1dj7'
});

client.authenticate(function(error, client) {
    if (error) {
        return Error(error);
    }

    getToDoItems();
    pullChanges();
});

function pullChanges() {
    client.pullChanges(null, function(error, changes) {
        if (error) {
            return Error(error);
        }

        client.pollForChanges(changes, {}, updateList);
    });
}

var isList = '#',
    isItem = '-',
    hasSpace = ' ',
    done = ' - DONE';

function getToDoItems() {
    var todo = [];

    function appendList(list) {
        if (!list) {
            return;
        }

        todo.push(list);
    }

    client.readFile('todo.markdown', function(error, data) {
        if (error) {
            return Error(error);
        }

        var lines = data.split('\n'),
            currentList = null;

        for (var i=0; i<lines.length; i++) {
            var line = lines[i];
            switch (line[0]) {
                case isList:
                    appendList(currentList);
                    currentList = {
                        title: line.replace(isList+hasSpace, ''),
                        items: [],
                        length: 0
                    }
                    break;
                case '-':
                    currentList['items'].push({
                        text: line.replace(isItem+hasSpace, '').replace(done, ''),
                        completed: line.indexOf(done) > -1
                    });
                    currentList['length'] += line.indexOf(done) === -1;
                    break;
            }
        }

        appendList(currentList);
        render(todo);
    });
}

function updateList(error, changes) {
    if (error) {
        return Error(error);
    }

    if (changes['hasChanges']) {
        getToDoItems();
        pullChanges();
    }
}

var template = 'Lists',
    container = 'list-container';

function render(lists) {
    var html = Mustache.render(document.getElementById(template).innerHTML, {lists: lists});
    document.getElementById(container).innerHTML = html;
}

function Error(error) {
    console.log(error);
}
