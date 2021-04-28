

class KLineChart {
    // k线红绿色
    red = '#dd6b66';
    green = '#73a373';
    // 主图标记
    markList = []

    // 指标尾部下标
    i = 1

    /**
     * tooltip格式化
     * @param {*} color 颜色
     * @param {*} name 名称
     * @param {*} value 值
     */
    format(color, name, value) {
        return `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${color};"></span>${name}: ${value} <br />`
    }

    /**
     * 计算均线
     * 
     * @param {*} day 均线周期
     * @param {*} data 数据
     * @param {*} path 数组项里的键值
     */
    calMA(day, data, path) {
        var result = [];
        for (var i = 0, len = data.length; i < len; i++) {
            if (i < day) {
                result.push('-');
                continue;
            }
            var sum = 0;
            for (var j = 0; j < day; j++) {
                var item = data[i - j];
                if (path) {
                    sum += item[path];
                } else {
                    sum += item;
                }
            }
            result.push((sum / day).toFixed(2));
        }
        return result;
    }

    /**
     * 
     * @param {string[]} dates 日期数组
     * @param {Array[]} klineData k线数据数组，内部结构[open, close, low, high]
     * @param {Number[]} volData 成交量数组
     * @param {string} name 标题
     */
    constructor(sel, dates, klineData, volData, name) {
        const dataMA5 = this.calMA(5, klineData, 1);
        const dataMA10 = this.calMA(10, klineData, 1);
        const dataMA30 = this.calMA(30, klineData, 1);
        const dataMA60 = this.calMA(60, klineData, 1);
        const dataMAVOL5 = this.calMA(5, volData);
        const dataMAVOL10 = this.calMA(10, volData);

        this.$el = document.querySelector(sel)
        this.width = this.$el.clientWidth
        this.height = this.$el.clientHeight
        this.dates = dates

        this.tpl = {
            animation: true,
            animationDuration: 100,
            title: {
                left: 'center',
                text: name
            },
            legend: {
                top: 30,
                data: ['K线', 'MA5', 'MA10', 'MA30', 'MA60']
            },
            tooltip: {
                //triggerOn: 'none',
                transitionDuration: 0,
                confine: true,
                bordeRadius: 4,
                borderWidth: 1,
                trigger: 'axis',
                borderColor: '#333',
                backgroundColor: 'rgba(255,255,255,0.8)',
                axisPointer: {
                    animation: true,
                    type: 'cross',
                    lineStyle: {
                        color: '#ccc',
                        width: 1,
                        opacity: .8
                    }
                },
                formatter: (p) => {
                    var current = p[0]
                    let axisIdx = current.axisIndex
                    let idx = current.dataIndex
                    let txt = ''
                    if (current.componentSubType == 'candlestick') {
                        // K线，显示OCLH和MA
                        let [_, open, close, low, high] = current.data
                        let color = close >= open ? this.red : this.green;

                        txt += this.format(color, '开盘价', open)
                        txt += this.format(color, '收盘价', close)
                        txt += this.format(color, '最低价', low)
                        txt += this.format(color, '最高价', high)
                        txt += '<br/>'
                        if (idx != 0) {
                            const lstBar = klineData[idx - 1]
                            // 昨收
                            const lstClose = lstBar[1]
                            let delta = ((close - lstClose) * 100 / lstClose).toFixed(2)
                            delta = delta > 0 ? `+${delta}%` : `${delta}%`
                            txt += this.format(color, '涨跌幅', delta)
                            txt += '<br/>'
                        }

                    }
                    for (const item of p) {
                        // 跳过k线
                        if (item.componentSubType == 'candlestick') continue;


                        if (item.axisIndex == axisIdx) {
                            // 是目标坐标系
                            txt += this.format(item.color, item.seriesName, item.data)
                        }
                    }
                    return txt
                },
                textStyle: {
                    fontSize: 12,
                    color: '#333'
                },
                position: function (pos, params, el, elRect, size) {
                    var obj = {
                        top: 60
                    };
                    obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 5;
                    return obj;
                }
            },
            axisPointer: {
                label: {
                    backgroundColor: '#666'
                },
                link: [{
                    // 添加新图链接进来
                    xAxisIndex: [0, 1]
                }]
            },
            dataZoom: [{
                type: 'slider',
                // 添加新图设置缩放
                xAxisIndex: [0, 1],
                realtime: true,
                start: 90,
                end: 100,
                top: 65,
                height: 20,
                handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                handleSize: '120%'
            }, {
                type: 'inside',
                xAxisIndex: [0, 1],
                start: 90,
                end: 100,
                top: 60,
                height: 20
            }],
            xAxis: [{
                type: 'category',
                data: dates,
                boundaryGap: false,
                axisLine: { lineStyle: { color: '#777' } },
                axisLabel: {
                    formatter: function (value) {
                        return echarts.format.formatTime('yyyy-MM-dd', value);
                    }
                },
                min: 'dataMin',
                max: 'dataMax',
                axisPointer: {
                    show: true
                }
            },
            {
                type: 'category',
                gridIndex: 1,
                data: dates,
                scale: true,
                boundaryGap: false,
                splitLine: { show: false },
                axisLabel: { show: false },
                axisTick: { show: false },
                axisLine: { lineStyle: { color: '#777' } },
                splitNumber: 20,
                min: 'dataMin',
                max: 'dataMax',
                axisPointer: {
                    type: 'shadow',
                    label: { show: false },
                    triggerTooltip: true,

                }
            }
            ],
            yAxis: [
                {
                    scale: true,
                    splitNumber: 2,
                    axisLine: { lineStyle: { color: '#777' } },
                    splitLine: { show: true },
                    axisTick: { show: false },
                    axisLabel: {
                        inside: true,
                        formatter: '{value}\n'
                    }
                },
                {
                    scale: true,
                    gridIndex: 1,
                    splitNumber: 2,
                    axisLine: { lineStyle: { color: '#777' } },
                    axisLabel: { show: false },
                    axisLine: { show: false },
                    axisTick: { show: false },
                    splitLine: { show: false }
                },
            ],
            grid: [
                // 主图
                {
                    left: 20,
                    right: 20,
                    top: 120,
                    height: '40%'
                },
                // 成交量
                {
                    left: 20,
                    right: 20,
                    height: '10%',
                    top: 0.4 * this.height + 120 + 30
                }
            ],
            graphic: [],
            series: [
                {
                    name: 'Volume',
                    type: 'bar',
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    itemStyle: {
                        color: (v) => {
                            var idx = v.dataIndex;
                            var kline = klineData[idx];
                            if (kline[1] > kline[0]) {
                                return this.red;
                            } else if (kline[1] < kline[0]) {
                                return this.green;
                            } else {
                                return '#ccc';
                            }
                        }
                    },
                    emphasis: {
                        itemStyle: {
                        }
                    },
                    data: volData
                },
                // 五,十量线
                {
                    name: 'MAVOL5',
                    type: 'line',
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    data: dataMAVOL5,
                    smooth: true,
                    showSymbol: false,
                    lineStyle: {
                        color: '#ccc',
                        width: 1
                    }
                },
                {
                    name: 'MAVOL10',
                    type: 'line',
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    data: dataMAVOL10,
                    smooth: true,
                    showSymbol: false,
                    lineStyle: {
                        color: '#eeff00',
                        width: 1
                    }
                },
                {
                    type: 'candlestick',
                    name: 'K线',
                    data: klineData,
                    markPoint: {
                        itemStyle: {
                            normal: {
                                label: {
                                    formatter: function (param) {
                                        return param != null ? param.value : '···';
                                    },
                                    offset: [1, 5],
                                    show: true,
                                    position: 'inside',
                                    textStyle: {
                                        color: '#fff'
                                    }
                                },
                                textColor: '#000'
                            },
                            emphasis: {
                                label: {
                                    show: true
                                }
                            }
                        },
                        data: this.markList,
                        tooltip: {
                            formatter: function (param) {
                                return param.name + '<br>' + (param.data.coord || '');
                            }
                        }
                    },
                    itemStyle: {
                        color: this.red,
                        color0: this.green,
                        borderColor: this.red,
                        borderColor0: this.green
                    },
                    emphasis: {
                        itemStyle: {
                        }
                    }
                },
                // 5，10，,30，60均线在前端计算
                {
                    name: 'MA5',
                    type: 'line',
                    xAxisIndex: 0,
                    yAxisIndex: 0,
                    data: dataMA5,
                    smooth: true,
                    showSymbol: false,
                    lineStyle: {
                        width: 1
                    }
                }, {
                    name: 'MA10',
                    type: 'line',
                    xAxisIndex: 0,
                    yAxisIndex: 0,
                    data: dataMA10,
                    smooth: true,
                    showSymbol: false,
                    lineStyle: {
                        width: 1
                    }
                }, {
                    name: 'MA30',
                    type: 'line',
                    xAxisIndex: 0,
                    yAxisIndex: 0,
                    data: dataMA30,
                    smooth: true,
                    showSymbol: false,
                    lineStyle: {
                        width: 1
                    }
                },
                {
                    name: 'MA60',
                    type: 'line',
                    xAxisIndex: 0,
                    yAxisIndex: 0,
                    data: dataMA60,
                    smooth: true,
                    showSymbol: false,
                    lineStyle: {
                        width: 1
                    }
                }]
        }
    }

    /**
     * 主图标注
     */
    addMarking(date, text, yCoord, color = '#fff') {
        this.markList.push({
            name: `${date}_${yCoord}_${text}`,
            coord: [date, yCoord],
            value: text,
            symbol: 'pin',
            symbolKeepAspect: true,
            symbolSize: [130, 35], // 容器大小
            symbolOffset: [0, 0], //位置偏移
            symbolRotate: '0',
            label: {
                color: color
            },
            itemStyle: {
                color: 'rgba(0,0,0,0)'
            }
        })
        this.echart.setOption(this.tpl)
    }

    /**
     * 增加新指标
     * @param {*} name 指标显示名
     * @returns 
     */
    addIndicator(name) {
        this.i++

        this.tpl.axisPointer.link[0].xAxisIndex.push(this.i)
        this.tpl.dataZoom.map((v) => {
            v.xAxisIndex.push(this.i)
            return v
        })
        // 新增x轴
        let xAxisTpl = {
            type: 'category',
            gridIndex: 1,
            data: this.dates,
            scale: true,
            boundaryGap: false,
            splitLine: { show: false },
            axisLabel: { show: false },
            axisTick: { show: false },
            axisLine: { lineStyle: { color: '#777' } },
            splitNumber: 20,
            min: 'dataMin',
            max: 'dataMax',
            axisPointer: {
                type: 'shadow',
                label: { show: false },
                triggerTooltip: true,

            }
        }
        // 新增y轴
        xAxisTpl.gridIndex = this.i
        this.tpl.xAxis.push(xAxisTpl)
        let yAxisTpl = {
            scale: true,
            gridIndex: 2,
            name: name,
            nameTextStyle: {
                align: 'left'
            },
            splitNumber: 2,
            axisLine: { lineStyle: { color: '#777' } },
            axisLine: { show: false },
            axisLabel: { show: false },
            min: 'dataMin',
            max: 'dataMax',
            axisTick: { show: false },
            splitLine: { show: true }
        }
        yAxisTpl.gridIndex = this.i
        this.tpl.yAxis.push(yAxisTpl)

        const lastIdx = this.tpl.grid.length - 1
        // 计算top
        const lstGrid = this.tpl.grid[lastIdx]
        // NOTE: 指标高10%
        const offsetTop = lstGrid.top + 0.1 * this.height + 50

        // 新增图区
        let gridTpl = {
            left: 20,
            right: 20,
            height: '10%',
            top: offsetTop
        }
        this.tpl.grid.push(gridTpl)

        return this
    }

    /**
     * TODO: 条件marking指标  显示B/S点
     * @param Array data 
     * @param Function render 
     */
    addConditionMarking(data, renderer) {

    }


    /**
     * 增加新指标中的参数
     * @param {*} name 参数显示名
     * @param {*} type echart类型
     * @param {*} data 数据数组
     * @param {*} extra 其他配置
     * @returns 
     */
    addParam(name, type, data, extra = {}) {
        let cfg = {}
        if (extra) {
            Object.assign(cfg, extra)
        }
        cfg.name = name
        cfg.type = type
        cfg.data = data
        cfg.xAxisIndex = this.i
        cfg.yAxisIndex = this.i
        this.tpl.series.push(cfg)
        return this
    }

    mount() {
        this.echart = echarts.init(this.$el, 'dark');
        this.echart.setOption(this.tpl);
        return this
    }

    refresh() {
        this.echart.setOption(this.tpl);
    }
};