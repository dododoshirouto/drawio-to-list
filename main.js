query = (v) => document.querySelector(v);
queryAll = (v) => [...document.querySelectorAll(v)];
HTMLElement.prototype.query = function (v) {
    return this.querySelector(v);
};
HTMLElement.prototype.queryAll = function (v) {
    return [...this.querySelectorAll(v)];
};

function addCloseTag(src) {
    return src.replace(/<([^\s>]+)([^>]*)\/>/g, '<$1$2></$1>');
}

function expandGraph() {
    let src = decodeURIComponent(query('#input').value);
    let src_tags = addCloseTag(src);
    query('#mxgraphmodel_root').innerHTML = src_tags;
    getObjects(query('#mxgraphmodel_root'));
}

cableColorList = {
    default: 'ケーブル',
    '#82B366': 'HDMI',
    '#6C8EBF': 'SDI',
    '#B85450': 'XLR',
    '#9673A6': '他 音声',
};

objects = [];
function getObjects(parent = document.body) {
    let elems = parent.queryAll('root>*');
    let objs = elems.map((elem) => {
        let obj = {};
        obj.name = (elem.getAttribute('value') || elem.getAttribute('label'))?.replace(/(<br>)+/g, ' ');
        let mxcell = elem.tagName.toUpperCase() == 'MXCELL' ? elem : elem.query('mxcell');
        obj.color = mxcell
            .getAttribute('style')
            ?.match(/strokeColor=([^;]+);/)
            ?.at(1);
        obj.points =
            mxcell
                .getAttribute('style')
                ?.match(/points=([^;]+);/)
                ?.at(1) || '[]';
        obj.points = JSON.parse(obj.points);
        obj.parent = mxcell.getAttribute('parent') - 0;

        obj.category = 'unknown';
        if (obj.name && obj.parent <= 1) obj.category = 'kizai';
        else if (!obj.name && !obj.parent <= 1) {
            obj.category = 'cable';
            obj.name = cableColorList[obj.color?.toUpperCase() || 'default'];
        } else if (obj.name && !obj.parent <= 1) obj.category = 'label';

        return obj;
    });

    console.log(objs);
    objects = objs;
    return objs;
}

function createList(root = query('#list_output')) {
    root.innerHTML = '';

    let list_counts = {};
    objects
        .filter((v) => v.category == 'kizai')
        .forEach((v) => {
            if (list_counts[v.name]) list_counts[v.name] += 1;
            else list_counts[v.name] = 1;
        });
    objects
        .filter((v) => v.category == 'cable')
        .forEach((v) => {
            if (list_counts[v.name]) list_counts[v.name] += 1;
            else list_counts[v.name] = 1;
        });

    console.log(list_counts);

    // create table from list_counts
    let html = '';
    for (let key in list_counts) {
        html += `<tr><td>${key}</td><td>${list_counts[key] || 'ケーブル'}</td></tr>`;
    }
    root.innerHTML = html;
}

query('#input').addEventListener('input', () => {
    expandGraph();
    createList();
});
