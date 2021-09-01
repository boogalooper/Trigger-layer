///////////////////////////////////////////////////////////////////////////////
// Trigger layer
// jazz-y@ya.ru
///////////////////////////////////////////////////////////////////////////////

/*
// BEGIN__HARVEST_EXCEPTION_ZSTRING
<javascriptresource>
<name>Trigger layer</name>
<category>jazzy</category>
<eventid>e20aa721-61ef-4edb-a670-4b93b69f0348</eventid>
</javascriptresource>
// END__HARVEST_EXCEPTION_ZSTRING
*/

#target photoshop

$.localize = true
//$.locale = "ru"

const GUID = 'e20aa721-61ef-4edb-a670-4b93b69f0348',
    DESCGUID = '0c65653c-1707-4b74-b21b-cae1ac06b614';

var cfg = new Config,
    AM = new ActionManager,
    str = new Lexicon,
    evt = new Events,
    target, event,
    rev = 0.341,
    s2t = stringIDToTypeID,
    t2s = typeIDToStringID;

try {
    target = t2s((arguments[0].getReference(s2t('null'))).getDesiredClass())
    event = t2s(arguments[1])
} catch (e) { }

main()

function main() {
    AM.getScriptSettings(cfg)

    if (!target) {
        var w = buildWindow(), result = 0
        try { result = w.show() } catch (e) { }

        if (result == 1 || result == 2) app.eraseCustomOptions(DESCGUID)

        if (result == 1) {
            cfg.fromCopy = false
            AM.putScriptSettings(cfg)
        }

        if (result != 0) {
            if (cfg.enabled && cfg.triggers.count) {
                evt.addEvt()
            } else (evt.delEvt())
        }
    } else {
        if (event != 'selectNoLayers') {
            if (cfg.debug) $.hiresTimer

            var len = cfg.triggers.count,
                found = false,
                anyLayer = [],
                id = AM.getLayerProperty(d = s2t('layerID'), null, true).getInteger(d),
                docId = AM.getDocProperty(d = s2t('documentID'), true).getInteger(d),
                lrName = AM.getLayerProperty(d = s2t('name'), id, true).getString(d),
                lrLabel = AM.getLayerProperty(d = s2t('color'), id, true, true) ? str.icoObj[t2s(AM.getLayerProperty(d = s2t('color'), id, true).getEnumerationValue(d))] : str.icoObj['none'],
                lrKind = str.layerKindArray[AM.getLayerProperty(d = s2t('layerKind'), id, true).getInteger(d)],
                currentTool = t2s(AM.getAppProperty(d = s2t('tool'), true).getEnumerationType(d)),
                userMask = AM.getLayerProperty(d = s2t('hasUserMask'), id, true).getBoolean(d) || AM.getLayerProperty(d = s2t('hasVectorMask'), id, true).getBoolean(d),
                hasFilterMask = AM.getLayerProperty(s2t('hasFilterMask'), id, true, true) ? AM.getLayerProperty(d = s2t('hasFilterMask'), id, true).getBoolean(d) : false,
                layerEffects = AM.getLayerProperty(s2t('layerEffects'), id, true, true),
                channel = AM.getChannelProperty(d = s2t('channelName'), true).getString(d),
                effects = hasFilterMask || layerEffects;


            if (Number($.getenv('docId')) != docId || Number($.getenv('layerId')) != id || $.getenv('channel') != channel) {
                for (var i = 0; i < len; i++) {
                    if (AM.getDescOptions(cfg.triggers.getObjectValue(i), 'mask')) {
                        if (triggerLayer(AM.getListItemObject(cfg.triggers, i))) {
                            found = true;
                            break;
                        }
                    } else { anyLayer.push(i) }
                }

                if (!found) {
                    len = anyLayer.length
                    for (var i = 0; i < len; i++) {
                        if (triggerLayer(AM.getListItemObject(cfg.triggers, anyLayer[i]))) {
                            break;
                        }
                    }
                }
            }
        } else {
            var id = 0,
                docId = 0,
                channel = '';
        }
        $.setenv('docId', docId)
        $.setenv('layerId', id)
        $.setenv('channel', channel)
    }

    function triggerLayer(cur) {
        if (!cur.enabled) return false;
        if (!cur.layerMode && target == 'channel') return false;
        if (cur.layerMode && target == 'action') return false;
        if (cur.layerMode && target == 'layer') return false;

        if (!cur.layerMode) {
            if (cur.mask) { if (!checkMask(lrName, cur.mask, cur.fullMatch)) return false; }
            if (cur.label != 0) { if (cur.label != lrLabel) return false; }
            if (cur.type != 0) { if (cur.type != lrKind) return false; }
            if (cur.userMask) { if (!userMask) return false; }
            if (cur.effects) { if (!effects) return false; }
        } else {
            if (cur.mask) { if (!checkMask(channel, cur.mask, cur.fullMatch)) return false; }
        }

        if (cur.action == 0) {
            if (cur.doNotChangeTool) { if (currentTool != cur.tool) return false; }
            AM.selectTool(cur.tool)
            if (cur.saveSettings) { AM.setToolOptions(cur.tool, cur.toolOptions) }

            if (cfg.debug) {
                alert(createTriggerLabel(cur) + '\n' + str.Timer + $.hiresTimer / 1000000 + 's')
                $.hiresTimer
            }
            return cur.bypass ? false : true;

        } else if (cur.action == 1) {
            if (AM.checkAction(cur.set, cur.atn)) { AM.runAction(cur.set, cur.atn) }

            if (cfg.debug) {
                alert(createTriggerLabel(cur) + '\n' + str.Timer + $.hiresTimer / 1000000 + 's')
                $.hiresTimer
            }

            return cur.bypass ? false : true;
        } else {
            try { $.evalFile(cur.script) } catch (e) { }

            if (cfg.debug) {
                alert(createTriggerLabel(cur) + '\n' + str.Timer + $.hiresTimer / 1000000 + 's')
                $.hiresTimer
            }
            return cur.bypass ? false : true;
        }
    }

    function checkMask(s, mask, fullMatch) {
        if (fullMatch) {
            if (s.indexOf(mask) == -1) return false;
            if (s.length != mask.length) return false;
        } else {
            var a = s.toUpperCase(),
                b = mask.toUpperCase();
            if (a.indexOf(b) == -1) return false;
        }
        return true
    }
}

function buildWindow() {
    // W
    // =
    var w = new Window('dialog');
    w.text = 'Trigger layer' + ' ' + rev;
    w.orientation = 'column';
    w.alignChildren = ['left', 'top'];
    w.spacing = 10;
    w.margins = 16;

    // PNLIST
    // ======
    var pnList = w.add('panel', undefined, undefined, { name: 'pnList' });
    pnList.text = str.TriggersList
    pnList.orientation = 'column';
    pnList.alignChildren = ['left', 'top'];
    pnList.spacing = 10;
    pnList.margins = 10;

    // GRMAIN
    // ======
    var grMain = pnList.add('group', undefined, { name: 'grMain' });
    grMain.orientation = 'row';
    grMain.alignChildren = ['left', 'center'];
    grMain.spacing = 10;
    grMain.margins = 0;

    var list = grMain.add('listbox', undefined, undefined, { name: 'list' });
    list.selection = 0;
    list.preferredSize.width = 650;
    list.preferredSize.height = 200;

    // GRBN
    // ====
    var grBn = grMain.add('group', undefined, { name: 'grBn' });
    grBn.orientation = 'column';
    grBn.alignChildren = ['center', 'center'];
    grBn.spacing = 10;
    grBn.margins = 0;
    grBn.alignment = ['left', 'top'];

    var bnAdd = grBn.add('button', undefined, undefined, { name: 'bnAdd' });
    bnAdd.text = str.Add;
    bnAdd.preferredSize.width = 95;

    var bnDel = grBn.add('button', undefined, undefined, { name: 'bnDel' });
    bnDel.text = str.Delete;
    bnDel.preferredSize.width = 95;

    var bnUp = grBn.add('button', undefined, undefined, { name: 'bnUp' });
    bnUp.text = str.Up;
    bnUp.preferredSize.width = 95;

    var bnDown = grBn.add('button', undefined, undefined, { name: 'bnDown' });
    bnDown.text = str.Down;
    bnDown.preferredSize.width = 95;

    // GROUP1
    // ======
    var grSpace = grBn.add('group', undefined, { name: 'grSpace' });
    grSpace.preferredSize.height = 30;
    grSpace.orientation = 'row';
    grSpace.alignChildren = ['left', 'center'];
    grSpace.spacing = 10;
    grSpace.margins = 0;

    var bnRemoveAll = grBn.add('button', undefined, undefined, { name: 'bnRemoveAll' });
    bnRemoveAll.text = str.RemoveAll;
    bnRemoveAll.preferredSize.width = 95;

    // PNLIST
    // ======
    // GROUP2
    // ======
    var groupSettings = pnList.add('group');

    var chEnable = groupSettings.add('checkbox', undefined, undefined, { name: 'chEnable' });
    chEnable.text = str.ListEnabled;
    chEnable.preferredSize.width = 650;

    var bnParams = groupSettings.add('button', undefined, undefined, { name: 'bnParams' });
    bnParams.text = str.Params;
    bnParams.preferredSize.width = 95;


    // GRBUTTONS
    // =========
    var grButtons = w.add('group', undefined, { name: 'grButtons' });
    grButtons.orientation = 'row';
    grButtons.alignChildren = ['left', 'top'];
    grButtons.spacing = 10;
    grButtons.margins = 0;
    grButtons.alignment = ['center', 'top'];

    var ok = grButtons.add('button', undefined, undefined, { name: 'ok' });
    ok.text = 'Ok';

    var cancel = grButtons.add('button', undefined, undefined, { name: 'cancel' });
    cancel.text = str.Cancel;

    var cfgTMP = new Config
    AM.getScriptSettings(cfgTMP, true)

    if (cfgTMP.fromCopy) {
        cfg = cfgTMP
        cfg.exchange.toStream()
        var result = addTrigger(cfg.exchange, AM.getDescOptions(cfg.exchange, 'addMode'), AM.getDescOptions(cfg.exchange, 'sourceItem'))
        if (result != null) {
            if (result.count) {
                if (AM.getDescOptions(result, 'addMode')) {
                    renewList(AM.putObjectToTriggersList(result, AM.getDescOptions(result, 'sourceItem'), 'add'))
                } else {
                    renewList(AM.putObjectToTriggersList(result, AM.getDescOptions(result, 'sourceItem'), 'update'))
                }
            } else { renewList(AM.getDescOptions(cfg.exchange, 'sourceItem')) }
        } else {
            cfg.fromCopy = true
            AM.putScriptSettings(cfg, true)
            w.close()
        }
    }

    chEnable.onClick = function () {
        cfg.enabled = this.value
    }

    bnAdd.onClick = function () {
        var result = addTrigger(new ActionDescriptor, true, list.selection != null ? list.selection.index : -1)
        if (!result) {
            cfg.fromCopy = true
            AM.putScriptSettings(cfg, true)
            w.close()
        } else {
            if (result.count) {
                renewList(AM.putObjectToTriggersList(result, AM.getDescOptions(result, 'sourceItem'), 'add'))
            }
        }
    }

    bnParams.onClick = function () {
        if (settings()) renewList()
    }

    list.onClick = function () {
        bnDel.enabled = list.selection == null || !cfg.triggers.count ? false : true
        if (list.selection != null) {
            bnUp.enabled = list.selection.index == 0 || !cfg.triggers.count ? false : true
            bnDown.enabled = list.selection.index == list.items.length - 1 || !cfg.triggers.count ? false : true
        } else { bnUp.enabled = bnDown.enabled = false }
    }

    list.onDoubleClick = function () {
        if (cfg.triggers.count && list.selection != null) {
            var result = addTrigger(cfg.triggers.getObjectValue(list.selection.index), false, list.selection.index)
            if (result != null) {
                if (result.count) {
                    renewList(AM.putObjectToTriggersList(result, list.selection.index, 'update'))
                }
            } else {
                cfg.fromCopy = true
                AM.putScriptSettings(cfg, true)
                w.close()
            }
        }
    }

    bnDel.onClick = function () {
        renewList(AM.putObjectToTriggersList(undefined, list.selection.index, 'del'))
    }

    bnUp.onClick = function () {
        renewList(AM.putObjectToTriggersList(undefined, list.selection.index, 'up'))
    }

    bnDown.onClick = function () {
        renewList(AM.putObjectToTriggersList(undefined, list.selection.index, 'down'))
    }

    bnRemoveAll.onClick = function () {
        renewList(AM.putObjectToTriggersList())
    }

    w.onShow = function () {
        chEnable.value = cfg.enabled
        bnAdd.active = true
        if (!cfg.fromCopy) renewList()
    }

    return w

    function renewList(cur) {
        var len = cfg.triggers.count
        list.removeAll()

        if (len) {
            for (var i = 0; i < len; i++) {
                list.add('item', createTriggerLabel(AM.getListItemObject(cfg.triggers, i)))
                list.items[i].checked = AM.getListItemObject(cfg.triggers, i).enabled
            }
            list.selection = cur
        } else {
            list.add('item', str.NullList)
        }
        bnRemoveAll.enabled = bnDel.enabled = cfg.triggers.count ? true : false
        bnUp.enabled = cur == 0 || !cfg.triggers.count ? false : true
        bnDown.enabled = cur == list.items.length - 1 || !cfg.triggers.count ? false : true
    }

}

function addTrigger(desc, addMode, sourceItem) {
    var w = new Window('dialog');
    w.text = str.TriggerSettings;
    w.orientation = 'column';
    w.alignChildren = ['left', 'top'];
    w.spacing = 10;
    w.margins = 16;

    var chActive = w.add('checkbox', undefined, undefined, { name: 'chActive' });
    chActive.text = str.TriggerEnabled;

    // PNSOURCE
    // ========
    var pnSource = w.add('panel', undefined, undefined, { name: 'pnSource' });
    pnSource.text = str.Source;
    pnSource.orientation = 'column';
    pnSource.alignChildren = ['left', 'top'];
    pnSource.spacing = 10;
    pnSource.margins = [10, 15, 10, 10];

    // GMODE
    // =====
    var gMode = pnSource.add('group', undefined, { name: 'gMode' });
    gMode.orientation = 'row';
    gMode.alignChildren = ['left', 'center'];
    gMode.spacing = 10;
    gMode.margins = 0;

    var stMode = gMode.add('statictext', undefined, undefined, { name: 'stMode' });
    stMode.text = str.Mode;
    stMode.preferredSize.width = 100;

    var dlMode = gMode.add('dropdownlist', undefined, undefined, { name: 'dlMode', items: str.mode_array });
    dlMode.preferredSize.width = 235;

    // GMASK
    // =====
    var gMask = pnSource.add('group', undefined, { name: 'gMask' });
    gMask.orientation = 'row';
    gMask.alignChildren = ['left', 'center'];
    gMask.spacing = 10;
    gMask.margins = 0;

    var stMask = gMask.add('statictext', undefined, undefined, { name: 'stMask' });
    stMask.text = str.Mask;
    stMask.preferredSize.width = 100;

    var etMask = gMask.add('edittext {properties: {name: "etMask"}}');
    etMask.preferredSize.width = 235;

    // PNSOURCE
    // ========
    var chFullMatch = pnSource.add('checkbox', undefined, undefined, { name: 'chFullMatch' });
    chFullMatch.text = str.FullMatch;
    // chFullMatch.preferredSize.width = 155;

    var grlayerMode = pnSource.add('group', undefined, { name: 'grlayerMode' });
    grlayerMode.orientation = 'column';
    grlayerMode.alignChildren = ['left', 'center'];

    // GTYPE
    // =====
    var gType = grlayerMode.add('group', undefined, { name: 'gType' });
    gType.orientation = 'row';
    gType.alignChildren = ['left', 'center'];
    gType.spacing = 10;
    gType.margins = 0;

    var stType = gType.add('statictext', undefined, undefined, { name: 'stType' });
    stType.text = str.LayerType;
    stType.preferredSize.width = 100;

    var dlType = gType.add('dropdownlist', undefined, undefined, { name: 'dlType', items: str.Type_array });
    dlType.selection = 0;
    dlType.preferredSize.width = 235;

    // GLABEL
    // ======
    var gLabel = grlayerMode.add('group', undefined, { name: 'gLabel' });
    gLabel.orientation = 'row';
    gLabel.alignChildren = ['left', 'center'];
    gLabel.spacing = 10;
    gLabel.margins = 0;

    var stLabel = gLabel.add('statictext', undefined, undefined, { name: 'stLabel' });
    stLabel.text = str.LayerLabel;
    stLabel.preferredSize.width = 100;

    var dlLabel = gLabel.add('dropdownlist', undefined, undefined, { name: 'dlLabel', items: str.Label_array });
    dlLabel.preferredSize.width = 235;

    var chUserMask = grlayerMode.add('checkbox', undefined, undefined, { name: 'chUserMask' });
    chUserMask.text = str.UserMask;
    //chUserMask.preferredSize.width = 155;

    var chEffects = grlayerMode.add('checkbox', undefined, undefined, { name: 'chEffects' });
    chEffects.text = str.Effects;
    //chEffects.preferredSize.width = 155;

    // PNTARGET
    // ========
    var pnTarget = w.add('panel', undefined, undefined, { name: 'pnTarget' });
    pnTarget.text = str.Action;
    pnTarget.orientation = 'column';
    pnTarget.alignChildren = ['left', 'top'];
    pnTarget.spacing = 10;
    pnTarget.margins = [10, 15, 10, 10];

    // GRACTION
    // ========
    var grAction = pnTarget.add('group', undefined, { name: 'grAction' });
    grAction.orientation = 'row';
    grAction.alignChildren = ['left', 'center'];
    grAction.spacing = 10;
    grAction.margins = 0;

    var stAction = grAction.add('statictext', undefined, undefined, { name: 'stAction' });
    stAction.text = str.Activate;
    stAction.preferredSize.width = 100;

    var dlAction = grAction.add('dropdownlist', undefined, undefined, { name: 'dlAction', items: str.Action_array });
    dlAction.preferredSize.width = 235;

    // W
    // =
    var chBypass = w.add('checkbox', undefined, undefined, { name: 'chBypass' });
    chBypass.text = str.Bypass;

    // GRBUTTONS
    // =========
    var grButtons = w.add('group', undefined, { name: 'grButtons' });
    grButtons.orientation = 'row';
    grButtons.alignChildren = ['left', 'top'];
    grButtons.spacing = 10;
    grButtons.margins = 0;
    grButtons.alignment = ['center', 'top'];

    var result = null
    w.addMode = addMode
    w.sourceItem = sourceItem

    var ok = grButtons.add('button', undefined, undefined, { name: 'ok' });
    ok.text = 'Ok';

    var cancel = grButtons.add('button', undefined, undefined, { name: 'cancel' });
    cancel.text = str.Cancel;

    dlMode.onChange = function () {
        grlayerMode.enabled = !this.selection.index
    }

    dlAction.onChange = function () {
        ok.enabled = true
        if (pnTarget.children.length > 1) { pnTarget.remove(pnTarget.children[1]) }

        switch (this.selection.index) {
            case 0: addTool(this.parent); break;
            case 1: addAction(this.parent); break;
            case 2: addScript(this.parent); break;
        }

        w.layout.layout(true)
    }

    etMask.onChanging = function () {
        chFullMatch.visible = this.text == '' ? false : true
    }
    chFullMatch.onClick = function () {
        cfg.fullMatch = this.value
    }

    chUserMask.onClick = function () {
        cfg.userMask = this.value
    }

    chEffects.onClick = function () {
        cfg.effects = this.value
    }

    chBypass.onClick = function () {
        cfg.bypass = this.value
    }

    ok.onClick = function () {
        result = AM.windowsSettingsToDesc(w)
        w.close()
    }

    cancel.onClick = function () {
        result = new ActionDescriptor
        w.close()
    }

    w.onShow = function () {
        for (var i = 0; i < str.icoArr.length; i++) { dlLabel.items[i].image = str.icoArr[i] }

        if (desc.count == 0) {
            if (AM.getAppProperty('numberOfDocuments')) {
                if (AM.getChannelProperty('itemIndex') == -1) {
                    dlMode.selection = 0
                    var t = AM.getLayerProperty('name')
                    if (t) { etMask.text = t } else { etMask.text = AM.getLayerProperty('name', 1) }
                } else {
                    dlMode.selection = 1
                    etMask.text = AM.getChannelProperty('channelName')
                }
                var c = AM.getLayerProperty('color')
                c = c ? c[1] : null
                if (c == 'none' || c == null) { dlLabel.selection = 0 } else { dlLabel.selection = str.icoObj[c] }
                var t = str.layerKindArray[AM.getLayerProperty('layerKind')]
                if (t == 1) { dlType.selection = 0 } else { dlType.selection = t }
            } else {
                dlMode.selection = 0
                dlLabel.selection = 0
                dlType.selection = 0
            }
            etMask.active = true
            chFullMatch.value = cfg.fullMatch
            chUserMask = cfg.userMask
            chEffects = cfg.effects
            dlAction.selection = 0
            chActive.value = true
            chBypass.value = cfg.bypass
        } else {
            AM.settingsObjToWindow(desc, w, true)
        }
        chFullMatch.visible = etMask.text == '' ? false : true
    }

    w.show();
    return result

    function addTool(parent) {
        // GRTOOL
        // ======
        var grTool = pnTarget.add('group', undefined, { name: 'grTool' });
        grTool.orientation = 'column';
        grTool.alignChildren = ['left', 'center'];
        grTool.spacing = 10;
        grTool.margins = 0;

        // GBNTOOL
        // =======
        var gBnTool = grTool.add('group', undefined, { name: 'gBnTool' });
        gBnTool.orientation = 'row';
        gBnTool.alignChildren = ['left', 'center'];
        gBnTool.spacing = 10;
        gBnTool.margins = 0;

        var stTool = gBnTool.add('statictext', undefined, undefined, { name: 'stTool' });
        stTool.preferredSize.width = 100;

        var bnSelect = gBnTool.add('button', undefined, undefined, { name: 'bnSelect' });
        bnSelect.text = str.Select;
        bnSelect.preferredSize.width = 235;

        // GRTOOL
        // ======
        var chSaveSettings = grTool.add('checkbox', undefined, undefined, { name: 'chSaveSettings' });
        chSaveSettings.text = str.ToolPreset;

        var chDoNotChangeTool = grTool.add('checkbox', undefined, undefined, { name: 'chDoNotChangeTool' });
        chDoNotChangeTool.text = str.DoNotChangeTool;
        chDoNotChangeTool.preferredSize.width = 335;

        if (desc.count == 0 || AM.getDescOptions(desc, 'tool') == null) {
            bnSelect.text = AM.getAppProperty('tool')[0]
            parent.parent.parent.toolOptions = AM.getCurrentToolOptions()
            chSaveSettings.value = cfg.saveSettings
            chDoNotChangeTool.value = cfg.doNotChangeTool
        } else {
            AM.settingsObjToWindow(desc, w, false)
        }

        chSaveSettings.onClick = function () {
            desc = AM.windowsSettingsToDesc(w, false, desc)
            cfg.saveSettings = this.value
        }

        chDoNotChangeTool.onClick = function () {
            desc = AM.windowsSettingsToDesc(w, false, desc)
            cfg.doNotChangeTool = this.value
        }

        bnSelect.onClick = function () {
            cfg.exchange = AM.windowsSettingsToDesc(parent.parent.parent, true)
            evt.addEvt(true)
            w.close()

            var bt = new BridgeTalk(),
                ph = BridgeTalk.getSpecifier('photoshop'),
                f = ";f('" + $.fileName.toString() + "','" + str.Cpt + "','" + str.TipLabel + "','" + str.SelectTool + "');",
                z = "(function fnctn(scriptPath, cpt, tipLabel, selectTool) {\
                    var z = Window.find('palette', 'Tool Select');\
                    if (!z) z = Window.find('palette', 'Выбор инструмента');\
                \
                    if (z) {\
                        z.show();\
                        return;\
                    }\
                \
                    var d = new Window('palette');\
                    d.text = cpt;\
                    d.orientation = 'row';\
                    d.alignChildren = ['left', 'top'];\
                    d.spacing = 10;\
                    d.margins = 16;\
                \
                    var grTool = d.add('group');\
                    grTool.orientation = 'column';\
                    grTool.alignChildren = ['left', 'center'];\
                    grTool.spacing = 10;\
                    grTool.alignment = ['left', 'center'];\
                \
                    var stTip = grTool.add('statictext');\
                    stTip.preferredSize.width = 250;\
                    stTip.justify = 'center';\
                    stTip.text = tipLabel;\
                \
                    var stTool = grTool.add('statictext');\
                    stTool.preferredSize.width = 250;\
                    stTool.justify = 'center';\
                \
                    var grBn = d.add('group');\
                    grBn.orientation = 'column';\
                    grBn.alignChildren = ['center', 'center'];\
                    grBn.spacing = 10;\
                \
                    var ok = grBn.add('button');\
                    ok.text = selectTool;\
                    ok.preferredSize.width = 90;\
                    ok.onClick = function () {\
                        var f = File(Folder.temp + '/selectToolWindow.jsx');\
                        for (var i = 0; i < app.notifiers.length; i++) {\
                            var ntf = app.notifiers[i];\
                            if (ntf.eventFile.name == f.name) { ntf.remove(); i-- };\
                        }\
                        f.remove();\
                        d.hide();\
                        $.evalFile(scriptPath);\
                    }\
                \
                    d.onShow = function () {\
                        r = new ActionReference();\
                        r.putProperty(stringIDToTypeID('property'), stringIDToTypeID('tool'));\
                        r.putEnumerated(stringIDToTypeID('application'), stringIDToTypeID('ordinal'), stringIDToTypeID('targetEnum'));\
                        stTool.text = typeIDToStringID(executeActionGet(r).getEnumerationType(stringIDToTypeID('tool')));\
                        this.active = true;\
                    }\
                \
                    d.show();\
                })"

            bt.target = ph;
            bt.body = "var f=" + z + f;
            bt.send();
        }

    }

    function addAction(parent) {
        var autoLoadAtn = true
        // GRACTION1
        // =========
        var grAction1 = pnTarget.add('group', undefined, { name: 'grAction1' });
        grAction1.orientation = 'column';
        grAction1.alignChildren = ['left', 'center'];
        grAction1.spacing = 10;
        grAction1.margins = 0;

        // GRSET
        // =====
        var grSet = grAction1.add('group', undefined, { name: 'grSet' });
        grSet.orientation = 'row';
        grSet.alignChildren = ['left', 'center'];
        grSet.spacing = 10;
        grSet.margins = 0;

        var StSet = grSet.add('statictext', undefined, undefined, { name: 'StSet' });
        StSet.text = str.Set;
        StSet.preferredSize.width = 100;
        StSet.justify = 'left';

        var dlSet = grSet.add('dropdownlist', undefined, undefined, { name: 'dlSet' });
        dlSet.preferredSize.width = 235;

        // GRATN
        // =====
        var grAtn = grAction1.add('group', undefined, { name: 'grAtn' });
        grAtn.orientation = 'row';
        grAtn.alignChildren = ['left', 'center'];
        grAtn.spacing = 10;
        grAtn.margins = 0;

        var stAtn = grAtn.add('statictext', undefined, undefined, { name: 'stAtn' });
        stAtn.text = str.Atn;
        stAtn.preferredSize.width = 100;
        stAtn.justify = 'left';

        var dlAtn = grAtn.add('dropdownlist', undefined, undefined, { name: 'dlAtn' });
        dlAtn.preferredSize.width = 235;

        var actionList = AM.getActionsList(),
            currentAction = AM.getCurrentAction()

        dlSet.onChange = function () {
            if (this.selection) {
                dlAtn.removeAll()
                for (var i = 0; i < actionList[this.selection.index][1].length; i++) {
                    dlAtn.add('item', actionList[this.selection.index][1][i])
                }
                if (autoLoadAtn) dlAtn.selection = 0
            }
        }

        dlAtn.onChange = function () {
            desc = AM.windowsSettingsToDesc(w, false, desc)
        }

        if (AM.getDescOptions(desc, 'set') != null) {
            var set = AM.getDescOptions(desc, 'set'),
                atn = AM.getDescOptions(desc, 'atn'),
                found = false;

            for (var i = 0; i < actionList.length; i++) {
                if (actionList[i][0] == set) {
                    if (findAction(actionList[i][1], atn)) {
                        found = true
                        break;
                    }
                }
            }
            if (!found) actionList.unshift([AM.getDescOptions(desc, 'set'), [AM.getDescOptions(desc, 'atn')]])
        }

        for (var i = 0; i < actionList.length; i++) {
            dlSet.add('item', actionList[i][0])
        }

        autoLoadAtn = false
        if (desc.count == 0 || AM.getDescOptions(desc, 'set') == null) {
            if (actionList.length) {
                if (currentAction) {
                    dlSet.selection = dlSet.find(currentAction[0])
                    dlAtn.selection = dlAtn.find(currentAction[1])
                } else {
                    if (actionList.length) {
                        dlSet.selection = 0
                        dlAtn.selection = 0
                    } else {
                        dlSet.enabled = false
                        dlAtn.enabled = false
                    }
                }
            } else {
                ok.enabled = false
            }
        } else {
            AM.settingsObjToWindow(desc, w, false)
        }
        autoLoadAtn = true

        function findAction(a, atn) {
            for (var i = 0; i < a.length; i++) {
                if (a[i] == atn) return true
            }
            return false
        }
    }

    function addScript(parent) {
        // GRACTION1
        // =========
        var grScript = pnTarget.add('group', undefined, { name: 'grAction1' });
        grScript.orientation = 'column';
        grScript.alignChildren = ['left', 'center'];
        grScript.spacing = 10;
        grScript.margins = 0;

        // SCRIPT
        // =====
        var grScript1 = grScript.add('group', undefined, { name: 'grSet' });
        grScript1.orientation = 'row';
        grScript1.alignChildren = ['left', 'center'];
        grScript1.spacing = 10;
        grScript1.margins = 0;

        var stScript = grScript1.add('statictext', undefined, undefined, { name: 'StSet' });
        stScript.text = str.Script;
        stScript.preferredSize.width = 100;
        stScript.justify = 'left';

        var dlScript = grScript1.add('dropdownlist', undefined, undefined, { name: 'dlScript' });
        dlScript.selection = 0;
        dlScript.preferredSize.width = 235;

        checkScriptPath()
        rebuildScriptsList()

        dlScript.onChange = function () {
            if (this.selection) {
                if (this.selection.index == this.items.length - 1) {
                    if ($.os.match(/win/i) != null) {
                        fle = File.openDialog(str.AddScript, '*.jsx', false)
                    } else {
                        fle = File.openDialog(str.AddScript, function (f) {
                            return f.fsName.match(/\.(jsx)$/i);
                        }, true);
                        if (fle.length > 0) fle = fle[0]
                    }

                    if (fle) {
                        var f = String(decodeURI(fle))
                        if (findScriptPath(f) == -1) {
                            cfg.scriptList = cfg.scriptList == '' ? f : cfg.scriptList + '\n' + f
                        }

                        w.script = f
                        desc = AM.windowsSettingsToDesc(w, false, desc)
                    }
                    rebuildScriptsList()
                } else {
                    var f = cfg.scriptList.split('\n')
                    w.script = f[this.selection.index]

                    desc = AM.windowsSettingsToDesc(w, false, desc)
                }
            }
        }

        function rebuildScriptsList() {
            AM.settingsObjToWindow(desc, w, false)
            dlScript.removeAll()

            if (w.script != undefined) {
                if (findScriptPath(w.script) == -1) {
                    cfg.scriptList = w.script + '\n' + cfg.scriptList
                }
            }

            var list = cfg.scriptList.split('\n')
            for (var i = 0; i < list.length; i++) {
                if (list[i] != '') dlScript.add('item', decodeURI(File(list[i]).name))
            }

            if (list[0] != '') { dlScript.add('separator') }
            dlScript.add('item', str.Browse)

            dlScript.selection = findScriptPath(w.script)
            ok.enabled = dlScript.items.length == 1 ? false : true
        }

        if (w.script == undefined) dlScript.selection = 0

        function checkScriptPath() {
            var output = [],
                list = cfg.scriptList.split('\n');

            for (var i = 0; i < list.length; i++) {
                var f = File(list[i])
                if (f.exists) output.push(list[i])
            }
            cfg.scriptList = output.join('\n')
        }

        function findScriptPath(s) {
            var list = cfg.scriptList.split('\n'),
                found = false;

            for (var i = 0; i < list.length; i++) {
                if (list[i] == s) {
                    found = true;
                    return i;
                }
            }
            return -1
        }
    }
}

function settings() {
    var result = false
    // DIALOG
    // ======
    var w = new Window('dialog');
    w.text = str.Params
    w.orientation = 'column';
    w.alignChildren = ['left', 'top'];
    w.spacing = 10;
    w.margins = 16;

    // PANEL1
    // ======
    var pn = w.add('panel', undefined, undefined, { name: 'pn' });
    pn.text = str.Maintenance;
    pn.orientation = 'row';
    pn.alignChildren = ['center', 'top'];
    pn.spacing = 10;
    pn.margins = [10, 15, 10, 10];

    var bnExport = pn.add('button', undefined, undefined, { name: 'bnExport' });
    bnExport.text = str.Export;

    var bnImport = pn.add('button', undefined, undefined, { name: 'bnImport' });
    bnImport.text = str.Import;

    var chDebug = w.add('checkbox')
    chDebug.text = str.Debug

    // GROUP1
    // ======
    var grBn = w.add('group', undefined, { name: 'grBn' });
    grBn.orientation = 'row';
    grBn.alignChildren = ['left', 'center'];
    grBn.spacing = 10;
    grBn.margins = 0;
    grBn.alignment = ['center', 'top']

    var ok = grBn.add('button', undefined, undefined, { name: 'ok' });
    ok.text = 'Ок';

    chDebug.onClick = function () {
        cfg.debug = this.value
    }

    bnExport.onClick = function () {
        s = AM.convertObjToStream(cfg)

        var fle = new File('triggers.desc')
        var pth = fle.saveDlg(str.Export, '*.desc')
        try {
            if (pth) {
                pth.open('w')
                pth.encoding = 'BINARY'
                pth.write(s)
                pth.close
            }
        } catch (e) { alert(e, '', 1) }
        w.close()
    }

    bnImport.onClick = function () {
        try {
            if ($.os.match(/win/i) != null) {
                fle = File.openDialog(str.Import, '*.desc', false)
            } else {
                fle = File.openDialog(str.Import, function (f) {
                    return f.fsName.match(/\.(desc)$/i);
                }, true);
                if (fle.length > 0) fle = fle[0]
            }

            if (fle) {
                fle.open('r')
                fle.encoding = 'BINARY'
                var s = fle.read()
                fle.close
            }
            cfg = AM.convertStreamToObj(s)
            result = true
        } catch (e) { alert(e, '', 1) }
        w.close()
    }

    w.onShow = function () {
        chDebug.value = cfg.debug
    }

    w.show()
    return result
}

function createTriggerLabel(l) {
    var s = l.layerMode ? str.Channel + '. ' : str.Layer + '. ',
        t = !l.fullMatch && l.mask != '' ? str.Name + ' *' + l.mask + '*' : str.Name + ' ' + l.mask;
    s += l.mask != '' ? t : ''

    var t = '',
        h = ''
    if (!l.layerMode) {
        h += l.mask != '' ? ', ' : ''
        h += str.Type_array[l.type] + ', '
        h = l.mask != '' ? h.toLowerCase() : h

        t += str.Label_array[l.label]
        if (l.userMask) t += ', ' + str.UMask
        if (l.effects) t += ', ' + str.Effects
        t += '. '
        t = h + t.toLowerCase()
    } else {
        t += l.mask != '' ? '. ' : ''
    }

    s += t + str.Action_array[l.action] + ': '

    switch (l.action) {
        case 0:
            s += l.tool
            s += l.saveSettings ? str.Preset : ''
            s += l.doNotChangeTool ? str.DoNotChange : ''
            break;
        case 1:
            s += l.set + ' > ' + l.atn
            break;
        case 2: s += decodeURI(File(l.script).name)
            break;
    }

    s += '. ' + (l.bypass ? str.Next : str.Stop)

    return s
}

function createEventFile() {
    var z = "(\
    function fnctn() {\
        var z = Window.find('palette', 'Tool Select'),\
            r = new ActionReference();\
        if (!z) z = Window.find('palette', 'Выбор инструмента');\
        r.putProperty(stringIDToTypeID('property'), stringIDToTypeID('tool'));\
        r.putEnumerated(stringIDToTypeID('application'), stringIDToTypeID('ordinal'), stringIDToTypeID('targetEnum'));\
        if (z) z.children[0].children[1].text = typeIDToStringID(executeActionGet(r).getEnumerationType(stringIDToTypeID('tool')));\
    })"

    var msg = "var f=" + z + ";f();",
        f = File(Folder.temp + "/selectToolWindow.jsx");
    f.open('w');
    f.encoding = 'text';
    f.write(msg);
    f.close();
}

function ActionManager() {
    var s2t = stringIDToTypeID,
        t2s = typeIDToStringID;

    var gProperty = s2t('property'),
        gAction = s2t('action'),
        gActionSet = s2t('actionSet'),
        gOrdinal = s2t('ordinal'),
        gTargetEnum = s2t('targetEnum'),
        gDocument = s2t('document'),
        gLayer = s2t('layer'),
        gNumberOfChildren = s2t('numberOfChildren'),
        gApplication = s2t('application'),
        gName = s2t('name'),
        gParent = s2t('parentName'),
        gParentIndex = s2t('parentIndex'),
        gItemIndex = s2t('itemIndex'),
        gPlay = s2t('play'),
        gTarget = s2t('target'),
        gSelect = s2t('select'),
        gTo = s2t('to'),
        gSet = s2t('set'),
        gChannel = s2t('channel'),
        gTool = s2t('tool'),
        gCurrentToolOptions = s2t('currentToolOptions');

    this.getAppProperty = function (p, getDesc) {
        if (!getDesc) p = s2t(p);
        (r = new ActionReference()).putProperty(gProperty, p);
        r.putEnumerated(gApplication, gOrdinal, gTargetEnum)
        return getDesc ? executeActionGet(r) : getDescValue(executeActionGet(r), p)
    }

    this.getCurrentToolOptions = function () {
        (r = new ActionReference()).putProperty(gProperty, gTool);
        r.putEnumerated(gApplication, gOrdinal, gTargetEnum)
        return executeActionGet(r).getObjectValue(gCurrentToolOptions)
    }

    this.getDescOptions = function (d, p) {
        try { return getDescValue(d, s2t(p)) } catch (e) { return null }
    }

    this.getDocProperty = function (p, getDesc, idx) {
        if (!getDesc) p = s2t(p);
        (r = new ActionReference()).putProperty(gProperty, p);
        if (idx) {
            r.putIndex(gDocument, idx)
        } else {
            r.putEnumerated(gDocument, gOrdinal, gTargetEnum)
        }
        try {
            return getDesc ? executeActionGet(r) : getDescValue(executeActionGet(r), p)
        } catch (e) { return null }

    }

    this.getLayerProperty = function (p, id, getDesc, hasKey) {

        if (!getDesc) p = s2t(p);
        (r = new ActionReference()).putProperty(gProperty, p);
        if (id) {
            r.putIdentifier(gLayer, id)
        } else {
            r.putEnumerated(gLayer, gOrdinal, gTargetEnum)
        }
        try {
            if (hasKey) {
                return executeActionGet(r).hasKey(p)
            } else {
                return getDesc ? executeActionGet(r) : getDescValue(executeActionGet(r), p)
            }
        } catch (e) { return null }
    }

    this.getChannelProperty = function (p, getDesc) {

        if (!getDesc) p = s2t(p);
        (r = new ActionReference()).putProperty(gProperty, p)
        r.putEnumerated(gChannel, gOrdinal, gTargetEnum)
        try {
            return getDesc ? executeActionGet(r) : getDescValue(executeActionGet(r), p)
        } catch (e) { return null }
    }

    this.selectTool = function (tool) {
        tool = s2t(tool);
        (r = new ActionReference()).putClass(tool);
        (d = new ActionDescriptor()).putReference(gTarget, r);
        try {
            executeAction(gSelect, d, DialogModes.NO)
        } catch (e) { }
    }

    this.setToolOptions = function (tool, options) {
        (r = new ActionReference()).putClass(s2t(tool));
        (d = new ActionDescriptor()).putReference(gTarget, r);
        d.putObject(gTo, gTarget, options)
        try {
            executeAction(gSet, d, DialogModes.NO)
        } catch (e) { }
    }

    this.checkAction = function (set, atn) {
        (r = new ActionReference()).putName(gAction, atn);
        r.putName(gActionSet, set)
        try { executeActionGet(r).getString(gName) } catch (e) { return false }
        return true
    }

    this.runAction = function (set, atn) {
        (r = new ActionReference()).putName(gAction, atn);
        r.putName(gActionSet, set);
        (d = new ActionDescriptor()).putReference(gTarget, r);
        try {
            executeAction(gPlay, d)
        } catch (e) { }
    }

    function getDescValue(d, p) {
        switch (d.getType(p)) {
            case DescValueType.OBJECTTYPE: return (d.getObjectValue(p));
            case DescValueType.LISTTYPE: return d.getList(p);
            case DescValueType.REFERENCETYPE: return d.getReference(p);
            case DescValueType.BOOLEANTYPE: return d.getBoolean(p);
            case DescValueType.STRINGTYPE: return d.getString(p);
            case DescValueType.INTEGERTYPE: return d.getInteger(p);
            case DescValueType.LARGEINTEGERTYPE: return d.getLargeInteger(p);
            case DescValueType.DOUBLETYPE: return d.getDouble(p);
            case DescValueType.ALIASTYPE: return d.getPath(p);
            case DescValueType.CLASSTYPE: return d.getClass(p);
            case DescValueType.UNITDOUBLE: return (d.getUnitDoubleValue(p));
            case DescValueType.ENUMERATEDTYPE: return [t2s(d.getEnumerationType(p)), t2s(d.getEnumerationValue(p))];
            default: break;
        };
    }

    this.getScriptSettings = function (settingsObj, shadowCopy) {
        var k = shadowCopy ? DESCGUID : GUID
        try { var d = app.getCustomOptions(k) } catch (e) { }
        if (d != undefined) descriptorToObject(settingsObj, d)
    }

    this.putScriptSettings = function (settingsObj, shadowCopy) {
        var k = shadowCopy ? DESCGUID : GUID,
            d = objectToDescriptor(settingsObj)
        app.putCustomOptions(k, d)
    }

    function descriptorToObject(o, d) {
        var l = d.count;
        for (var i = 0; i < l; i++) {
            var k = d.getKey(i),
                t = d.getType(k);
            strk = app.typeIDToStringID(k);
            switch (t) {
                case DescValueType.BOOLEANTYPE:
                    o[strk] = d.getBoolean(k);
                    break;
                case DescValueType.STRINGTYPE:
                    o[strk] = d.getString(k);
                    break;
                case DescValueType.INTEGERTYPE:
                    o[strk] = d.getDouble(k);
                    break;
                case DescValueType.LISTTYPE:
                    o[strk] = d.getList(k);
                    break;
                case DescValueType.OBJECTTYPE:
                    o[strk] = d.getObjectValue(k);
                    break;
            }
        }
    }

    function objectToDescriptor(o) {
        var d = new ActionDescriptor;
        var l = o.reflect.properties.length;
        for (var i = 0; i < l; i++) {
            var k = o.reflect.properties[i].toString();
            if (k == '__proto__' || k == '__count__' || k == '__class__' || k == 'reflect') continue;
            var v = o[k];
            k = s2t(k);
            switch (typeof (v)) {
                case 'boolean': d.putBoolean(k, v); break;
                case 'string': d.putString(k, v); break;
                case 'number': d.putInteger(k, v); break;
                case 'object':
                    if (v.typename == 'ActionList') {
                        d.putList(k, v);
                    } else {
                        d.putObject(k, s2t('settings'), v)
                    }

                    break;
            }
        }
        return d;
    }

    this.windowsSettingsToDesc = function (parent, update, desc) {
        var w = {}
        if (desc) descriptorToObject(w, desc)
        w.mask = parent.findElement('etMask').text
        w.type = parent.findElement('dlType').selection.index
        w.label = parent.findElement('dlLabel').selection.index
        w.action = parent.findElement('dlAction').selection.index
        w.fullMatch = parent.findElement('chFullMatch').value
        w.layerMode = parent.findElement('dlMode').selection.index
        w.enabled = parent.findElement('chActive').value
        w.userMask = parent.findElement('chUserMask').value
        w.effects = parent.findElement('chEffects').value
        w.update = update ? true : false
        w.addMode = parent.addMode
        w.sourceItem = parent.sourceItem
        w.bypass = parent.findElement('chBypass').value

        switch (w.action) {
            case 0:
                w.tool = parent.findElement('bnSelect').text
                w.toolOptions = parent.toolOptions
                w.saveSettings = parent.findElement('chSaveSettings').value
                w.doNotChangeTool = parent.findElement('chDoNotChangeTool').value
                break;
            case 1:
                w.set = parent.findElement('dlSet').selection.text
                w.atn = parent.findElement('dlAtn').selection.text
                break;
            case 2:
                w.script = parent.script
                break;
        }
        return objectToDescriptor(w)
    }

    this.settingsObjToWindow = function (desc, parent, header) {
        var s = {}
        descriptorToObject(s, desc)

        if (header) {
            parent.findElement('etMask').text = s.mask
            parent.findElement('dlType').selection = s.type
            parent.findElement('dlLabel').selection = s.label
            parent.findElement('dlAction').selection = s.action
            parent.findElement('chFullMatch').value = s.fullMatch
            parent.findElement('dlMode').selection = s.layerMode
            parent.findElement('chUserMask').value = s.userMask
            parent.findElement('chEffects').value = s.effects
            parent.findElement('chActive').value = s.enabled
            parent.findElement('chBypass').value = s.bypass
        }

        switch (parent.findElement('dlAction').selection.index) {
            case 0:
                parent.findElement('bnSelect').text = s.update ? AM.getAppProperty('tool')[0] : s.tool
                parent.toolOptions = s.update ? AM.getCurrentToolOptions() : s.toolOptions
                parent.findElement('chSaveSettings').value = s.saveSettings
                parent.findElement('chDoNotChangeTool').value = s.doNotChangeTool
                if (s.update) { parent.findElement('bnSelect').active = true } else { parent.findElement('etMask').active = true }
                break;
            case 1:
                parent.findElement('dlSet').selection = parent.findElement('dlSet').find(s.set)
                parent.findElement('dlAtn').selection = parent.findElement('dlAtn').find(s.atn)
                break;
            case 2:
                parent.script = s.script
                break;
        }
    }

    this.putObjectToTriggersList = function (desc, cur, mode) {
        var list = new ActionList,
            len = cfg.triggers.count

        switch (mode) {
            case 'add':
                if (cur >= len || (cur == -1 && len != 0)) cur = len - 1
                for (var i = 0; i <= cur; i++) {
                    list.putObject(s2t('trigger'), cfg.triggers.getObjectValue(i))
                }
                list.putObject(s2t('trigger'), desc)
                cur++
                for (var i = cur; i < len; i++) {
                    list.putObject(s2t('trigger'), cfg.triggers.getObjectValue(i))
                }
                break;
            case 'del':
                for (var i = 0; i < cur; i++) {
                    list.putObject(s2t('trigger'), cfg.triggers.getObjectValue(i))
                }
                cur++
                for (var i = cur; i < len; i++) {
                    list.putObject(s2t('trigger'), cfg.triggers.getObjectValue(i))
                }
                cur = cur == len ? cur - 2 : cur - 1
                break;
            case 'up':
                cur--
                var sel = cfg.triggers.getObjectValue(cur + 1),
                    prev = cfg.triggers.getObjectValue(cur)

                for (var i = 0; i < cur; i++) {
                    list.putObject(s2t('trigger'), cfg.triggers.getObjectValue(i))
                }

                list.putObject(s2t('trigger'), sel)
                list.putObject(s2t('trigger'), prev)

                for (var i = cur + 2; i < len; i++) {
                    list.putObject(s2t('trigger'), cfg.triggers.getObjectValue(i))
                }

                break;
            case 'down':
                cur++
                var sel = cfg.triggers.getObjectValue(cur - 1),
                    next = cfg.triggers.getObjectValue(cur)

                for (var i = 0; i <= cur - 2; i++) {
                    list.putObject(s2t('trigger'), cfg.triggers.getObjectValue(i))
                }

                list.putObject(s2t('trigger'), next)
                list.putObject(s2t('trigger'), sel)

                for (var i = cur + 1; i < len; i++) {
                    list.putObject(s2t('trigger'), cfg.triggers.getObjectValue(i))
                }

                break;
            case 'update':
                for (var i = 0; i < cur; i++) {
                    list.putObject(s2t('trigger'), cfg.triggers.getObjectValue(i))
                }

                list.putObject(s2t('trigger'), desc)

                for (var i = cur + 1; i < len; i++) {
                    list.putObject(s2t('trigger'), cfg.triggers.getObjectValue(i))
                }
                break;
            default:
                var cur = -1
                break;
        }

        cfg.triggers = list
        return cur

    }

    this.getListItemObject = function (l, i) {
        descriptorToObject(o = {}, l.getObjectValue(i))
        return o
    }

    this.getActionsList = function () {
        var output = [],
            setCounter = 1;

        while (true) {
            (r = new ActionReference()).putIndex(gActionSet, setCounter)
            try { d = executeActionGet(r) } catch (e) { break; }

            output.push([d.getString(gName), []])

            var numberChildren = d.hasKey(gNumberOfChildren) ? d.getInteger(gNumberOfChildren) : 0
            var idx = setCounter - 1
            if (numberChildren > 0) output[idx][1] = getActionList(setCounter, numberChildren)
            setCounter++
        }

        function getActionList(setIndex, numChildren) {
            var current = [];
            for (var i = 1; i <= numChildren; i++) {
                (r = new ActionReference()).putIndex(gAction, i)
                r.putIndex(gActionSet, setIndex)
                current.push(executeActionGet(r).getString(gName))
            }
            return current
        }

        return output
    }

    this.getCurrentAction = function () {
        try {
            (r = new ActionReference()).putEnumerated(gAction, gOrdinal, gTargetEnum);

            var atnName = executeActionGet(r).getString(gParent),
                atnIndex = executeActionGet(r).getInteger(gParentIndex),
                setName = getSetName(atnName, atnIndex)
            if (setName) return [setName, atnName]
            else {
                atnName = executeActionGet(r).getString(gName)
                atnIndex = executeActionGet(r).getInteger(gItemIndex)
                setName = getSetName(atnName, atnIndex)
                if (setName) return [setName, atnName]
            }
        } catch (e) { }

        return null

        function getSetName(atnName, atnIndex) {
            var setCounter = 1
            while (true) {
                var ref = new ActionReference()
                ref.putIndex(gActionSet, setCounter)
                var desc = undefined
                try { desc = executeActionGet(ref) } catch (e) { break; }

                var numberChildren = desc.hasKey(gNumberOfChildren) ? desc.getInteger(gNumberOfChildren) : 0

                if (numberChildren > 0 && atnIndex <= numberChildren) {
                    var ref = new ActionReference()
                    ref.putProperty(gProperty, gName)
                    ref.putIndex(gAction, atnIndex)
                    ref.putIndex(gActionSet, setCounter)
                    if (executeActionGet(ref).getString(gName) == atnName) {
                        var ref = new ActionReference()
                        ref.putIndex(gActionSet, setCounter)
                        return executeActionGet(ref).getString(gName)
                    }
                }
                setCounter++
            }
            return null
        }
    }

    this.convertObjToStream = function (o) {
        return objectToDescriptor(o).toStream()
    }

    this.convertStreamToObj = function (s) {
        (d = new ActionDescriptor).fromStream(s);
        descriptorToObject(o = {}, d)
        return o
    }
}

function Config() {
    this.fullMatch = false
    this.saveSettings = true
    this.doNotChangeTool = false
    this.enabled = true
    this.fromCopy = false
    this.userMask = false
    this.effects = false
    this.scriptList = ''
    this.exchange = new ActionDescriptor
    this.triggers = new ActionList
    this.bypass = false
    this.debug = false
}

function Events() {

    this.addEvt = function (eventWindow) {
        this.delEvt()

        app.notifiersEnabled = true
        var handlerFile = File($.fileName)
        if (eventWindow) {
            createEventFile()
            app.notifiers.add('slct', File(Folder.temp + '/selectToolWindow.jsx'))
        } else {
            app.notifiers.add('slct', handlerFile, 'Lyr ')
            app.notifiers.add('Ply ', handlerFile)
            app.notifiers.add('slct', handlerFile, 'Chnl')
            app.notifiers.add('selectNoLayers', handlerFile)
        }
    }

    this.delEvt = function () {
        var f = File(Folder.temp + '/selectToolWindow.jsx').name,
            s = File($.fileName).name;
        for (var i = 0; i < app.notifiers.length; i++) {
            var ntf = app.notifiers[i]
            if (ntf.eventFile.name == s || ntf.eventFile.name == f) { ntf.remove(); i-- }
        }
    }
}

function Lexicon() {
    var AnyLabel = { ru: 'Любая отметка', en: 'Any label' },
        None = { ru: 'Без отметки', en: 'No color' },
        Red = { ru: 'Красный', en: 'Red' },
        Orange = { ru: 'Оранжевый', en: 'Orange' },
        Yellow = { ru: 'Желтый', en: 'Yellow' },
        Green = { ru: 'Зеленый', en: 'Green' },
        Blue = { ru: 'Синий', en: 'Blue' },
        Violet = { ru: 'Фиолетовый', en: 'Violet' },
        Gray = { ru: 'Серый', en: 'Gray' },
        AnyKind = { ru: 'Любой тип', en: 'Any kind' },
        icoRed = "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\n\x00\x00\x00\n\b\x06\x00\x00\x00\u008D2\u00CF\u00BD\x00\x00\x00;IDAT\x18\u0095c\u00FCci\u00F3\u009F\u0081\b\u00C0\x02R\u00C2((\u0084W\u00E5\u00FF\u00F7\u00EF \n\u00C1\u0080\u0087\x17\u00BB\u00AA/\u009F\u00C1\x14\x131\u00D6\x0E\x15\u0085\b_C}\u0087W!(\u009C\u00F0\x02\x06\x06\x06\x00\x18\u00EF\fO\u0083\b\u00CC\u00FD\x00\x00\x00\x00IEND\u00AEB`\u0082",
        icoOrange = "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\n\x00\x00\x00\n\b\x06\x00\x00\x00\u008D2\u00CF\u00BD\x00\x00\x00=IDAT\x18\u0095c\u00FC\u00D2\u00A1\u00FA\u009F\u0081\b\u00C0\x02R\u00C2$\u00C8\u008DW\u00E5\u00BF\u00F7_!\nA\u0080\u0091\u0097\x03\u00AB\u00A2\u00FF\u009F\x7F\u0080i&b\u00AC\x1D*\n\u00E1\u00BE\u0086\u00F9\x0E\u00AFBP8\u00E1\x05\f\f\f\x00\u00D6!\x0E\u0088\x06d\u00F3\x07\x00\x00\x00\x00IEND\u00AEB`\u0082",
        icoYellow = "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\n\x00\x00\x00\n\b\x06\x00\x00\x00\u008D2\u00CF\u00BD\x00\x00\x00;IDAT\x18\u0095c\u00FCp@\u00ED?\x03\x11\u0080\x05\u00A4\u0084\u0089\u0093\x1B\u00AF\u00CA\x7F\u00DF\u00BFB\x14\u0082\x15\u00B3s`W\u00F4\u00F3\x07D\u009E\x18k\u0087\u008AB\u00B8\u00AFa\u00BE\u00C3\u00AB\x10\x14Nx\x01\x03\x03\x03\x00+\u00AA\x0E\u00CA*\u0090\u00C3\u00A2\x00\x00\x00\x00IEND\u00AEB`\u0082",
        icoGreen = "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\n\x00\x00\x00\n\b\x06\x00\x00\x00\u008D2\u00CF\u00BD\x00\x00\x00=IDAT\x18\u0095c\u00F4\u00DEo\u00F8\u009F\u0081\b\u00C0\x02R\"\u00C6\u00C9\u008FW\u00E5\u00AB\u00EF\x1F!\nA@\u0090\u009D\x1B\u00AB\u00A2\u00F7?\u00BF\u0082i&b\u00AC\x1D*\n\u00E1\u00BE\u0086\u00F9\x0E\u00AFBP8\u00E1\x05\f\f\f\x000\x1F\x0E\x05z4V\u0094\x00\x00\x00\x00IEND\u00AEB`\u0082",
        icoBlue = "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\n\x00\x00\x00\n\b\x06\x00\x00\x00\u008D2\u00CF\u00BD\x00\x00\x00=IDAT\x18\u0095c4\u0099\u00F7\u00E1?\x03\x11\u0080\x05\u00A4D\u0080\u009F\t\u00AF\u00CA\x0F\x1F\u00FFA\x14\u0082\x007\x17v\u00C5_\u00BF\u00FD\x03\u00D3\u00F8\u008DB\x02CA!\u00DC\u00D70\u00DF\u00E1U\b\n'\u00BC\u0080\u0081\u0081\x01\x00\b\u00DD\x0E\u00A5\x7F\u00E7e\u008B\x00\x00\x00\x00IEND\u00AEB`\u0082",
        icoViolet = "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\n\x00\x00\x00\n\b\x06\x00\x00\x00\u008D2\u00CF\u00BD\x00\x00\x00=IDAT\x18\u0095c\u00DC\x1Fv\u00FD?\x03\x11\u0080\x05\u00A4\u0084S\u0092\r\u00AF\u00CA\u00EF\u00CF\x7FA\x14\u0082\x00\u00BB\x10\x0BVE?\u00DF\u00FD\x01\u00D3L\u00C4X;T\x14\u00C2\u00BD\n\u00F3\x1D^\u0085\u00A0p\u00C2\x0B\x18\x18\x18\x00KM\x0E\u00C2\u00AA\x19\u00A8d\x00\x00\x00\x00IEND\u00AEB`\u0082",
        icoGray = "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\n\x00\x00\x00\n\b\x06\x00\x00\x00\u008D2\u00CF\u00BD\x00\x00\x00=IDAT\x18\u0095clk\u00EB\u00FC\u00CF@\x04`\x01)\x11\x12\x12\u00C4\u00AB\u00F2\u00DD\u00BB\u00F7\x10\u0085 \u00C0\u00CB\u00CB\u008BU\u00D1\u00E7\u00CF\u009F\u00C14\x131\u00D6\x0E\x15\u0085p_\u00C3|\u0087W!(\u009C\u00F0\x02\x06\x06\x06\x00\u00BE\u00A9\x0ET.#\u00D2&\x00\x00\x00\x00IEND\u00AEB`\u0082",
        icoNone = "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\n\x00\x00\x00\n\b\x06\x00\x00\x00\u008D2\u00CF\u00BD\x00\x00\x00\u00CEIDAT\x18\u0095\u008D\u0090A\x0BE@\x14\u0085\u00CFLS\u00A2,D6~\u0083R\u00CAF\u00E4WS\u0094\u0094\u00C8N\u00F9\x19R\u00D6\x12^s\u00DF3\u00CF\u00EA\u00F5NM3\u00E7\u00CE\u0099\u00B9_\u0097\x15Eq\u00E1\x0F\t\x19\t\u0082\x00\u00D7uA\bA\u00FBS\u00D2\u008F\u00E3\b\u008E\u008F\x19\u0086\x01\u0086a\u00C0u]Z\u009A\u00A6\u00A1\u00EB:\u00F5\u0090\u0082\u009CsDQ\u0084\u00B2,\u00B1m\x1B\u00D6uE]\u00D7H\u0092\x04\u008C1\nRk)\u00CF\u00F3\u00E0\u00FB>\u00F2<'\x1F\u00C71\x1C\u00C7\u00C1<\u00CF\u00DF\x1Fo\u0099\u00A6\u00A9\u00CE\x12\u00E3)\u00C5\u00B8,\x0B\u00FA\u00BEG\u009A\u00A6\b\u00C3\x10UU\x11\u00C2-j-9\u00DA\u00B6E\u0096e\u00B0,\x0B\u00B6mC\u00D7u4MC\b\u00F2\u009E\u0082\u00C7qPa\u00DFw\u00C5ts\u009E\u00E7\u00F9\x1E\u009D,L\u00D3\u00F4{\u00E2\x00^\u00D6\u0089Tf\u00E31\u0087\u00CC\x00\x00\x00\x00IEND\u00AEB`\u0082",
        icoAll = "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\n\x00\x00\x00\n\b\x06\x00\x00\x00\u008D2\u00CF\u00BD\x00\x00\x00\u00B5IDAT\x18\u0095\u008D\u0090K\n\u00840\x10D+C\u00FC\u00E5\x06\u00D9\u00B8\u00F7\n\"nt\u00E3\u0089\u00C5\u0095\u00E0!\u00B2\u00CC-\x14\u00F1\u0097\u00A1{\u00B0a\x10\u0086)(:\u00A4_WB\u00AB\u00BE\u00EF\x03\u00FE\u0090&\u00A4\u00AEk!\u0097e\u0081R\nY\u0096\u00C9\u00DD4M\x1F\u0090\u0094\u00A6)\u009Cs\u00F0\u00DE#I\x12\u00E4y\u008E\u00A2(x\x10w\"i]W\u0086\u00BA\u00AE\u00C3\u00BE\u00EF\x18\u00C7\x11\u00D6Z\u00C4q\u00CC\u00FD\u00D7\r\x1E\u00C7\u00C15\u008A\"N$x\u009Egy^\x12\u00E9_\u00D7ua\x18\x06i\u009E\u00E7)gI\f!0\u00DC\u00B6-\u009A\u00A6\u0091\u00E1G\u00A2\u00D6\u009A\u00BDm\x1B\x03dc\u00CC\x13\u00A4\u00C4\u00B2,\u00B9\u0092\u00AB\u00AA\u00E2M|\u0081\u00B4\u00A7\u009F\x02\u00F0\x06\x05\"C\u00AEZ\f\u00AC\x18\x00\x00\x00\x00IEND\u00AEB`\u0082",
        pixel = { ru: 'Графический слой', en: 'Pixel layer' },
        smart = { ru: 'Смарт-объект', en: 'Smart object' },
        text = { ru: 'Текстовый слой', en: 'Text layer' },
        group = { ru: 'Группа', en: 'Group' },
        vector = { ru: 'Векторный объект', en: 'Vector layer' },
        adjustment = { ru: 'Корректирующий слой', en: 'Adjustment layer' },
        fill = { ru: 'Заливка', en: 'Fill layer' },
        other = { ru: 'Прочее', en: 'Other' },
        tool = { ru: 'Инструмент', en: 'Tool' },
        action = { ru: 'Экшен', en: 'Action' },
        script = { ru: 'Скрипт', en: 'Script' };

    this.Label_array = [AnyLabel, Red, Orange, Yellow, Green, Blue, Violet, Gray, None],
        this.Type_array = [AnyKind, pixel, smart, text, group, vector, adjustment, fill, other],
        this.Action_array = [tool, action, script],
        this.icoArr = [icoAll, icoRed, icoOrange, icoYellow, icoGreen, icoBlue, icoViolet, icoGray, icoNone],
        this.icoObj = { none: 8, red: 1, orange: 2, yellowColor: 3, grain: 4, blue: 5, violet: 6, gray: 7 },
        this.layerKindArray =
        [
            8, //const kAnySheet             = 0; 
            1, //const kPixelSheet           = 1;  
            6, //const kAdjustmentSheet      = 2;  
            3, //const kTextSheet            = 3;  
            5, //const kVectorSheet          = 4;  
            2, //const kSmartObjectSheet     = 5;  
            8, //const kVideoSheet           = 6;  
            4, //const kLayerGroupSheet      = 7;  
            8, //const k3DSheet              = 8;  
            7, //const kGradientSheet        = 9;  
            7, //const kPatternSheet         = 10;  
            7, //const kSolidColorSheet      = 11;  
            1, //const kBackgroundSheet      = 12;  
            8 //const kHiddenSectionBounder = 13;  
        ],
        this.Layer = { ru: 'Слой', en: 'Layer' },
        this.Channel = { ru: 'Канал', en: 'Channel' },
        this.mode_array = [this.Layer, this.Channel],
        this.TriggersList = { ru: 'Список триггеров:', en: 'Triggers list:' },
        this.Add = { ru: 'Добавить', en: 'Add' },
        this.Delete = { ru: 'Удалить', en: 'Delete' },
        this.Up = { ru: 'Вверх', en: 'Up' },
        this.Down = { ru: 'Вниз', en: 'Down' },
        this.RemoveAll = { ru: 'Удалить всё', en: 'Delete all' },
        this.ListEnabled = { ru: 'включить Trigger layer', en: 'enable Trigger layer' },
        this.Preset = { ru: ' (пресет)', en: ' (preset)' },
        this.DoNotChange = { ru: ', не изменять текущий инструмент', en: ', do not change current tool' },
        this.NullList = { ru: 'Нет инструментов/операций/скриптов ассоциированных со слоями', en: 'No tools/operations/scripts associated with layers' },
        this.TriggerSettings = { ru: 'Настройка триггера', en: 'Trigger settings' },
        this.Source = { ru: 'Источник:', en: 'Source:' },
        this.Mask = { ru: 'маска имени:', en: 'name mask:' },
        this.Name = { ru: 'Имя:', en: 'Name:' },
        this.FullMatch = { ru: 'полное совпадение', en: 'full match' },
        this.LayerType = { ru: 'тип слоя:', en: 'layer kind:' },
        this.LayerLabel = { ru: 'цветной ярлык:', en: 'color label:' },
        this.Action = { ru: 'Действие:', en: 'Action:' },
        this.Activate = { ru: 'активировать', en: 'activate:' },
        this.TriggerEnabled = { ru: 'триггер включен', en: 'trigger enabled' },
        this.Select = { ru: 'выбрать', en: 'select' },
        this.DoNotChangeTool = { ru: 'не переключать, если выбран другой инструмент', en: 'do not change if another tool is selected' },
        this.ToolPreset = { ru: 'запомнить настройки инструмента', en: 'remember tool settings' },
        this.Cpt = { ru: 'Выбор инструмента', en: 'Tool Select' },
        this.TipLabel = { ru: 'Выберите на панели нужный инструмент:', en: 'Select the desired tool from panel:' },
        this.SelectTool = { ru: 'Выбрать', en: 'Select' },
        this.Cpt = { ru: 'Выбор инструмента', en: 'Tool Select' },
        this.TipLabel = { ru: 'Выберите на панели нужный инструмент:', en: 'Select the desired tool from panel:' },
        this.SelectTool = { ru: 'Выбрать', en: 'Select' },
        this.Params = { ru: 'Настройки', en: 'Settings' },
        this.Atn = { ru: 'экшен:', en: 'action:' },
        this.Set = { ru: 'группа:', en: 'action set:' },
        this.Script = { ru: 'скрипт:', en: 'script:' },
        this.Browse = { ru: 'Обзор...:', en: 'Browse...' },
        this.AddScript = { ru: 'Выбрать файл скрипта', en: 'Select script file' },
        this.Cancel = { ru: 'Отмена', en: 'Cancel' },
        this.Maintenance = { ru: 'Управление настройками:', en: 'Settings management:' },
        this.Export = { ru: 'Экспорт в файл', en: 'Export to file' },
        this.Import = { ru: 'Импорт из файла', en: 'Import from file' },
        this.UserMask = { ru: 'есть пользовательская маска', en: 'has user mask' },
        this.Effects = { ru: 'есть эффекты', en: 'has effects' },
        this.UMask = { ru: 'есть маска', en: 'has mask' },
        this.Bypass = { ru: 'продолжить после срабатывания', en: 'continue after triggering' },
        this.Stop = { ru: 'Стоп', en: 'Stop' },
        this.Next = { ru: 'Продолжить', en: 'Continue' },
        this.Debug = { ru: 'включить режим отладки', en: 'enable debug mode' },
        this.Mode = { ru: 'режим:', en: 'mode:' }
    this.Timer = { ru: 'Время срабатывания: ', en: 'Response time: ' };

}
