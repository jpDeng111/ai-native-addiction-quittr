#!/usr/bin/env python3
"""Scrape all 140 seasons of 戒为良药 from kuaizhan.com"""

import os
import re
import time
import json
import urllib.request
from html.parser import HTMLParser

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "AddictionQuitr", "knowledge_base", "posts")

SEASONS = [
    {"season": 0, "title": "我戒色2年3个月的体悟（附：戒色的十个阶段）", "url": "https://jiese.kuaizhan.com/68/36/p21594404124029"},
    {"season": 1, "title": "屡戒屡败的根本原因——洗脑不彻底", "url": "https://jiese.kuaizhan.com/68/49/p21594466558661"},
    {"season": 2, "title": "屡戒屡败的思想误区之为恢复性功能而戒", "url": "https://jiese.kuaizhan.com/52/76/p215944380844df"},
    {"season": 3, "title": "教你彻底摆脱频遗的烦恼", "url": "https://jiese.kuaizhan.com/84/77/p249117564b03bb"},
    {"season": 4, "title": "警惕欲望休眠期和戒色厌倦情绪", "url": "https://jiese.kuaizhan.com/10/58/p2159454180d2c8"},
    {"season": 5, "title": "怎样补才能补到位", "url": "https://jiese.kuaizhan.com/9/41/p231776079e5194"},
    {"season": 6, "title": "前列腺炎、精索静脉曲张、早泄阳痿的恢复", "url": "https://jiese.kuaizhan.com/5/36/p232338414c08c7"},
    {"season": 7, "title": "戒色三阶段以及熬夜久坐的深入分析", "url": "https://jiese.kuaizhan.com/53/98/p232730484f21af"},
    {"season": 8, "title": "身高问题、脱发问题、痤疮和戒断反应", "url": "https://jiese.kuaizhan.com/9/81/p2330332710faff"},
    {"season": 9, "title": "耳鸣问题、戒色心态、搜集资料的重要性", "url": "https://jiese.kuaizhan.com/53/22/p2332484015d820"},
    {"season": 10, "title": "SY变丑详细论述和神衰、焦虑症、社恐的康复", "url": "https://jiese.kuaizhan.com/83/21/p233492208a9b5a"},
    {"season": 11, "title": "破戒后的心态调整、精不液化、JJ长度问题", "url": "https://jiese.kuaizhan.com/63/12/p2337895059da98"},
    {"season": 12, "title": "脱发问题补充、戒色后如何更好更快地恢复", "url": "https://jiese.kuaizhan.com/78/47/p2340049566a279"},
    {"season": 13, "title": "婚前性行为对人生的危害", "url": "https://jiese.kuaizhan.com/59/53/p25038876013ce5"},
    {"season": 14, "title": "黑眼圈眼袋、白发、痔疮、鼻炎问题详解", "url": "https://jiese.kuaizhan.com/35/34/p2342901008a2e7"},
    {"season": 15, "title": "腿软问题、出油问题、紧张障碍、阴囊潮湿", "url": "https://jiese.kuaizhan.com/28/20/p2345183644b06a"},
    {"season": 16, "title": "遗精问题补充、无害论、禁欲有害论、婚后次数", "url": "https://jiese.kuaizhan.com/49/63/p234875892a3a5f"},
    {"season": 17, "title": "如何克服意淫、反复现象、嗜睡、压力导致的SY", "url": "https://jiese.kuaizhan.com/27/18/p23490439280733"},
    {"season": 18, "title": "前列腺炎补充、睡眠问题、赖床破戒、周末破戒", "url": "https://jiese.kuaizhan.com/87/86/p2354049061e35f"},
    {"season": 19, "title": "晨勃问题、易漏问题、大便问题、睾丸小", "url": "https://jiese.kuaizhan.com/88/71/p235631982d3956"},
    {"season": 20, "title": "破戒类型，射距奥秘，连续2次的恶果", "url": "https://jiese.kuaizhan.com/47/12/p235890021ba6e6"},
    {"season": 21, "title": "SY完腹痛、意淫导致的疾病、睾丸的下垂", "url": "https://jiese.kuaizhan.com/50/18/p2363990434b887"},
    {"season": 22, "title": "做一个纯净频率的持有者", "url": "https://jiese.kuaizhan.com/61/61/p250388925b92a1"},
    {"season": 23, "title": "腰痛问题、虚胖和瘦弱问题、保持警惕的重要性", "url": "https://jiese.kuaizhan.com/18/84/p2364043357775f"},
    {"season": 24, "title": "戒色后脱发加重，瘦弱问题补充、脑力下降问题", "url": "https://jiese.kuaizhan.com/69/36/p23710423235c6e"},
    {"season": 25, "title": "直指阳痿、破戒时间的奥秘、SY伤精分类", "url": "https://jiese.kuaizhan.com/98/5/p23738871050668"},
    {"season": 26, "title": "戒色厌倦期、多汗问题、视力问题", "url": "https://jiese.kuaizhan.com/95/53/p237393108070b8"},
    {"season": 27, "title": "直指久坐、轻敌现象、尿泡沫问题", "url": "https://jiese.kuaizhan.com/90/72/p237725166df793"},
    {"season": 28, "title": "戒断反应、JJ偏向问题、精液颜色改变", "url": "https://jiese.kuaizhan.com/15/46/p237955656e2e4b"},
    {"season": 29, "title": "戒色状态的调整、发育障碍、紧张性遗精", "url": "https://jiese.kuaizhan.com/78/88/p249864468549e5"},
    {"season": 30, "title": "直指焦虑症，神经症，深挖神经症", "url": "https://jiese.kuaizhan.com/38/33/p2384448006d13c"},
    {"season": 31, "title": "恢复利器、性冷淡现象、梦中SY", "url": "https://jiese.kuaizhan.com/73/74/p238972485913cd"},
    {"season": 32, "title": "吸收率问题，戒色稳定期，精子质量", "url": "https://jiese.kuaizhan.com/36/96/p2389780027c332"},
    {"season": 33, "title": "SY出血、SY后头晕头痛、梦遗后破戒", "url": "https://jiese.kuaizhan.com/70/83/p266540205465e4"},
    {"season": 34, "title": "案例分析5例、直指早泄，终结早泄", "url": "https://jiese.kuaizhan.com/23/22/p2665414892c471"},
    {"season": 35, "title": "痊愈规律、医药费篇、慢前康复指南", "url": "https://jiese.kuaizhan.com/30/67/p24205839977e8d"},
    {"season": 36, "title": "SY危害总述", "url": "https://jiese.kuaizhan.com/13/14/p2420585765106f"},
    {"season": 37, "title": "YY终结者、克服恋X癖、恐惧症", "url": "https://jiese.kuaizhan.com/19/85/p250174485b8449"},
    {"season": 38, "title": "驳斥性学家谬论之适度无害论", "url": "https://jiese.kuaizhan.com/40/48/p2501749359ba1b"},
    {"season": 39, "title": "再谈破戒和21点揭示的戒色奥义", "url": "https://jiese.kuaizhan.com/88/38/p250175160cf2bb"},
    {"season": 40, "title": "如何应对症状反复期", "url": "https://jiese.kuaizhan.com/26/86/p250175328163b4"},
    {"season": 41, "title": "控遗之道详尽篇", "url": "https://jiese.kuaizhan.com/73/87/p65811662705326"},
    {"season": 42, "title": "关于SY症状的恢复问题", "url": "https://jiese.kuaizhan.com/44/42/p25038301570727"},
    {"season": 43, "title": "论气色及容貌气色恢复之秘技", "url": "https://jiese.kuaizhan.com/22/72/p241544307f4e42"},
    {"season": 44, "title": "关于魔考、憋与射之间（附戒色考卷）", "url": "https://jiese.kuaizhan.com/60/63/p250383216f3c54"},
    {"season": 45, "title": "关于戒色新人、情绪管理深谈", "url": "https://jiese.kuaizhan.com/9/85/p2503833998681f"},
    {"season": 46, "title": "压箱底的身体恢复秘籍之养生桩", "url": "https://jiese.kuaizhan.com/68/30/p250383552fecf9"},
    {"season": 47, "title": "良好戒色习惯的养成，时间效率管理", "url": "https://jiese.kuaizhan.com/8/90/p250383729cc122"},
    {"season": 48, "title": "身体恢复方法之艾灸经验和拉筋体会", "url": "https://jiese.kuaizhan.com/22/32/p2503839060b031"},
    {"season": 49, "title": "A级精子、关于建立正确的性观念", "url": "https://jiese.kuaizhan.com/68/54/p250384116a2659"},
    {"season": 50, "title": "戒色心髓十颂", "url": "https://jiese.kuaizhan.com/11/88/p2503843022863c"},
    {"season": 51, "title": "戒色就是一场念头的战争", "url": "https://jiese.kuaizhan.com/5/34/p233530488356fc"},
    {"season": 52, "title": "傲慢与破戒、谦卑之心、忏悔的力量", "url": "https://jiese.kuaizhan.com/55/20/p2340592351fc12"},
    {"season": 53, "title": "SY与脾虚、气胸案例分析", "url": "https://jiese.kuaizhan.com/6/3/p25038445521913"},
    {"season": 54, "title": "SY导致的心理症状详解", "url": "https://jiese.kuaizhan.com/60/60/p250384617f6a58"},
    {"season": 55, "title": "关于75党、SY无害论50条逐一破解", "url": "https://jiese.kuaizhan.com/85/96/p6581059595ff70"},
    {"season": 56, "title": "关于SY万病论、纵欲导致的过敏现象", "url": "https://jiese.kuaizhan.com/83/83/p250386342c2b83"},
    {"season": 57, "title": "眼神细腻篇、SY与抽筋现象", "url": "https://jiese.kuaizhan.com/4/33/p250386552060fd"},
    {"season": 58, "title": "痘痘外一篇、SY导致的结石症状", "url": "https://jiese.kuaizhan.com/49/33/p250386705b3ab6"},
    {"season": 59, "title": "SY与濒死感、SY与不真实感", "url": "https://jiese.kuaizhan.com/78/11/p250386888133b9"},
    {"season": 60, "title": "身体恢复方法大总结之真髓十滴", "url": "https://jiese.kuaizhan.com/51/41/p25038704770a09"},
    {"season": 61, "title": "脑力恢复之详尽篇", "url": "https://jiese.kuaizhan.com/58/2/p2503872068b110"},
    {"season": 62, "title": "必知戒色文章之红五类", "url": "https://jiese.kuaizhan.com/43/80/p2503873716ab46"},
    {"season": 63, "title": "戒色实战之五种反应", "url": "https://jiese.kuaizhan.com/19/9/p2503875243ac28"},
    {"season": 64, "title": "戒色气场学之研究与启示", "url": "https://jiese.kuaizhan.com/22/20/p2503876861ea7d"},
    {"season": 65, "title": "戒色必知之翻种子规律", "url": "https://jiese.kuaizhan.com/70/67/p25038785787ed3"},
    {"season": 66, "title": "如何成为顶尖的戒色高手", "url": "https://jiese.kuaizhan.com/19/0/p2503880167b8dd"},
    {"season": 67, "title": "念头实战之精粹总结篇", "url": "https://jiese.kuaizhan.com/70/96/p2503891414db9c"},
    {"season": 68, "title": "如蛇结自解之强迫症自愈", "url": "https://jiese.kuaizhan.com/51/21/p25038933923413"},
    {"season": 69, "title": "对境实战之五大原则", "url": "https://jiese.kuaizhan.com/73/33/p250389519cd0e3"},
    {"season": 70, "title": "慢前患者痊愈宝典", "url": "https://jiese.kuaizhan.com/54/5/p25038967571c66"},
    {"season": 71, "title": "精索静脉曲张详尽专版", "url": "https://jiese.kuaizhan.com/89/40/p250389825762c1"},
    {"season": 72, "title": "SY色关通关秘籍", "url": "https://jiese.kuaizhan.com/23/7/p25038997847deb"},
    {"season": 73, "title": "摆脱社恐之破茧重生", "url": "https://jiese.kuaizhan.com/94/43/p234315489d318a"},
    {"season": 74, "title": "戒色意识的培养——菜鸟到高手的必经之路", "url": "https://jiese.kuaizhan.com/50/16/p2345184693146d"},
    {"season": 75, "title": "SY导致的凹陷与浮肿问题", "url": "https://jiese.kuaizhan.com/98/85/p250394898589d7"},
    {"season": 76, "title": "50种破戒心理的研究", "url": "https://jiese.kuaizhan.com/82/26/p2503950638e930"},
    {"season": 77, "title": "教你突破觉悟增长的瓶颈期", "url": "https://jiese.kuaizhan.com/78/32/p250395684303d6"},
    {"season": 78, "title": "国外戒色28条精析", "url": "https://jiese.kuaizhan.com/97/2/p2503958551c11f"},
    {"season": 79, "title": "SY变丑52条臻粹分享", "url": "https://jiese.kuaizhan.com/45/32/p250396026dcaf3"},
    {"season": 80, "title": "提升戒色觉悟之进阶攻略", "url": "https://jiese.kuaizhan.com/80/65/p25039618816630"},
    {"season": 81, "title": "学习传统文化之蓦然回首", "url": "https://jiese.kuaizhan.com/31/1/p25039641027ac4"},
    {"season": 82, "title": "戒色战场的纪律与执行", "url": "https://jiese.kuaizhan.com/63/52/p25039697772173"},
    {"season": 83, "title": "冬季戒色养生之五大要点", "url": "https://jiese.kuaizhan.com/37/64/p25039714879c74"},
    {"season": 84, "title": "从入门到精通之断念实战", "url": "https://jiese.kuaizhan.com/60/23/p2503973075e7e6"},
    {"season": 85, "title": "戒色往事之失败激励篇", "url": "https://jiese.kuaizhan.com/60/46/p25039746636049"},
    {"season": 86, "title": "SY导致的心理性格的异变", "url": "https://jiese.kuaizhan.com/82/15/p250397616f569a"},
    {"season": 87, "title": "满精归来之能量管理", "url": "https://jiese.kuaizhan.com/71/8/p2503977722c7de"},
    {"season": 88, "title": "戒色特种兵是怎样炼成的", "url": "https://jiese.kuaizhan.com/46/40/p25039793730d33"},
    {"season": 89, "title": "论SY对人生运势的不良影响", "url": "https://jiese.kuaizhan.com/26/91/p2503980934abcd"},
    {"season": 90, "title": "觉知的点化——你是觉知而非念头", "url": "https://jiese.kuaizhan.com/2/79/p25039824389b55"},
    {"season": 91, "title": "戒者巅峰体验的研究", "url": "https://jiese.kuaizhan.com/50/29/p2503983874ca35"},
    {"season": 92, "title": "夏季戒色养生的分析与对策", "url": "https://jiese.kuaizhan.com/12/50/p2540611807b491"},
    {"season": 93, "title": "戒色价值观的培养", "url": "https://jiese.kuaizhan.com/98/51/p257407584c9a08"},
    {"season": 94, "title": "过于紧张带来的负面影响", "url": "https://jiese.kuaizhan.com/3/68/p26642915196f49"},
    {"season": 95, "title": "不孕不育详尽专版", "url": "https://jiese.kuaizhan.com/36/52/p269604621034a7"},
    {"season": 96, "title": "恢复工程之养生集结篇", "url": "https://jiese.kuaizhan.com/62/49/p2766145711c2fd"},
    {"season": 97, "title": "SY伤肾细腻体会篇", "url": "https://jiese.kuaizhan.com/53/47/p282336252fa299"},
    {"season": 98, "title": "戒SY重现清净光明坚固之相", "url": "https://jiese.kuaizhan.com/48/5/p289557687d8f86"},
    {"season": 99, "title": "断念之刃的精深磨砺", "url": "https://jiese.kuaizhan.com/18/86/p29679135322866"},
    {"season": 100, "title": "恍若隔世之戒色五年体悟", "url": "https://jiese.kuaizhan.com/22/19/p6580923007c258"},
    {"season": 101, "title": "破除恋癖之四件利器", "url": "https://jiese.kuaizhan.com/81/57/p30952644303136"},
    {"season": 102, "title": "破解心魔怂恿专题", "url": "https://jiese.kuaizhan.com/84/54/p317833686fd716"},
    {"season": 103, "title": "独处破戒的专题分析", "url": "https://jiese.kuaizhan.com/44/71/p32352240053781"},
    {"season": 104, "title": "戒油子的蜕变与逆袭", "url": "https://jiese.kuaizhan.com/37/37/p353587188d0c3e"},
    {"season": 105, "title": "睡眠障碍的分析与恢复", "url": "https://jiese.kuaizhan.com/98/66/p354094197bb8c8"},
    {"season": 106, "title": "浅谈曾国藩的戒色绝学", "url": "https://jiese.kuaizhan.com/59/51/p3564535202ed65"},
    {"season": 107, "title": "戒色后回归的十种感觉", "url": "https://jiese.kuaizhan.com/61/63/p3566101868e0c7"},
    {"season": 108, "title": "如何提升戒色文章的实战转化率", "url": "https://jiese.kuaizhan.com/10/15/p36750895882a7d"},
    {"season": 109, "title": "神衰患者的康复逆袭之路", "url": "https://jiese.kuaizhan.com/24/53/p367537371f4805"},
    {"season": 110, "title": "《菜根谭》对戒色的启示与意义", "url": "https://jiese.kuaizhan.com/94/12/p302191869d5124"},
    {"season": 111, "title": "学会擦除脑中浮现的图像", "url": "https://jiese.kuaizhan.com/76/34/p39661332302b5a"},
    {"season": 112, "title": "戒色的十种力量", "url": "https://jiese.kuaizhan.com/42/93/p396614646af640"},
    {"season": 113, "title": "SY对人际关系的不良影响", "url": "https://jiese.kuaizhan.com/88/58/p396615708b861d"},
    {"season": 114, "title": "戒色美如画之逆袭纯颜", "url": "https://jiese.kuaizhan.com/92/12/p499213704153d8"},
    {"season": 115, "title": "《传习录》对戒色的启示", "url": "https://jiese.kuaizhan.com/55/7/p499212600c7bf6"},
    {"season": 116, "title": "春季戒色养生的注意事项", "url": "https://jiese.kuaizhan.com/49/2/p499209816943a6"},
    {"season": 117, "title": "断念道场的修炼与进阶", "url": "https://jiese.kuaizhan.com/18/66/p4990418525714e"},
    {"season": 118, "title": "提升振动频率的秘密", "url": "https://jiese.kuaizhan.com/56/21/p499037496d4321"},
    {"season": 119, "title": "学生党戒色专季", "url": "https://jiese.kuaizhan.com/87/16/p49787850323891"},
    {"season": 120, "title": "戒色高手之路基础篇", "url": "https://jiese.kuaizhan.com/61/34/p49787697997f27"},
    {"season": 121, "title": "秋季戒色养生攻略", "url": "https://jiese.kuaizhan.com/97/45/p4977671133ffa2"},
    {"season": 122, "title": "戒色执行力的培养", "url": "https://jiese.kuaizhan.com/50/1/p49776511267a97"},
    {"season": 123, "title": "戒色快乐之道", "url": "https://jiese.kuaizhan.com/14/32/p497759967b4168"},
    {"season": 124, "title": "澄清对于断念口诀的误解", "url": "https://jiese.kuaizhan.com/31/81/p5836677300fcc3"},
    {"season": 125, "title": "正确处理戒色与生活的关系", "url": "https://jiese.kuaizhan.com/24/46/p65762097603a62"},
    {"season": 126, "title": "戒色钻石体系之戒色十规", "url": "https://jiese.kuaizhan.com/66/97/p65762066776caf"},
    {"season": 127, "title": "易经智慧与戒色之道", "url": "https://jiese.kuaizhan.com/41/51/p6576203169f752"},
    {"season": 128, "title": "《当下的力量》笔记分享与解析", "url": "https://jiese.kuaizhan.com/78/93/p6576200043a969"},
    {"season": 129, "title": "学习《了凡四训》的心得体会", "url": "https://jiese.kuaizhan.com/84/15/p6576195187124e"},
    {"season": 130, "title": "戒色八年记", "url": "https://jiese.kuaizhan.com/83/62/p657619179aef81"},
    {"season": 131, "title": "戒色修心勇士之道", "url": "https://jiese.kuaizhan.com/99/22/p65761883786e89"},
    {"season": 132, "title": "断念口诀的学、练、悟", "url": "https://jiese.kuaizhan.com/86/69/p65761825530c7c"},
    {"season": 133, "title": "戒色德训篇", "url": "https://jiese.kuaizhan.com/26/58/p657617886b85bd"},
    {"season": 134, "title": "沉迷游戏的不良影响", "url": "https://jiese.kuaizhan.com/49/49/p657600048e9844"},
    {"season": 135, "title": "托利在斯坦福大学谈话笔记与解析", "url": "https://jiese.kuaizhan.com/46/88/p6575973815a489"},
    {"season": 136, "title": "俞净意公给我们的启示", "url": "https://jiese.kuaizhan.com/39/47/p657595620c1f65"},
    {"season": 137, "title": "控遗之道终极篇", "url": "https://jiese.kuaizhan.com/35/52/p727614798719b7"},
    {"season": 138, "title": "再谈压念的思想误区", "url": "https://jiese.kuaizhan.com/84/22/p7276152511268c"},
    {"season": 139, "title": "戒色高手之路提高篇", "url": "https://jiese.kuaizhan.com/57/14/p727615491a5b28"},
    {"season": 140, "title": "九年零破的核心秘髓", "url": "https://jiese.kuaizhan.com/14/27/p72761580924676"},
]


class TextExtractor(HTMLParser):
    """Extract text content from HTML, focusing on article body."""
    def __init__(self):
        super().__init__()
        self.result = []
        self.skip_tags = {'script', 'style', 'nav', 'header', 'footer'}
        self.current_tag = None
        self.skip_depth = 0
        self.in_article = False
        self.paragraphs = []
        self.current_paragraph = []

    def handle_starttag(self, tag, attrs):
        self.current_tag = tag
        if tag in self.skip_tags:
            self.skip_depth += 1
        if tag in ('p', 'div', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li'):
            if self.current_paragraph:
                text = ''.join(self.current_paragraph).strip()
                if text:
                    self.paragraphs.append(text)
                self.current_paragraph = []

    def handle_endtag(self, tag):
        if tag in self.skip_tags:
            self.skip_depth -= 1
        if tag in ('p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li'):
            if self.current_paragraph:
                text = ''.join(self.current_paragraph).strip()
                if text:
                    self.paragraphs.append(text)
                self.current_paragraph = []

    def handle_data(self, data):
        if self.skip_depth <= 0:
            self.current_paragraph.append(data)

    def get_text(self):
        if self.current_paragraph:
            text = ''.join(self.current_paragraph).strip()
            if text:
                self.paragraphs.append(text)
        return '\n\n'.join(self.paragraphs)


def fetch_page(url):
    """Fetch a page and return the HTML content."""
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    })
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.read().decode('utf-8', errors='replace')
    except Exception as e:
        print(f"  Error fetching {url}: {e}")
        return None


def extract_article_text(html):
    """Extract the main article text from HTML."""
    parser = TextExtractor()
    parser.feed(html)
    text = parser.get_text()
    
    # Clean up common noise
    lines = text.split('\n\n')
    cleaned = []
    skip_patterns = [
        '关注', '扫一扫', '二维码', '微信', '公众号', '阅读原文',
        '点赞', '在看', '分享', '收藏', '举报', '投诉',
        'var ', 'function', 'window.', 'document.',
        '快站', 'kuaizhan', '搜狐', 'Copyright',
    ]
    for line in lines:
        line = line.strip()
        if not line:
            continue
        if len(line) < 2:
            continue
        if any(p in line for p in skip_patterns):
            continue
        cleaned.append(line)
    
    return '\n\n'.join(cleaned)


def save_season(season_num, title, content):
    """Save a season's content as a markdown file."""
    if season_num == 0:
        filename = "戒为良药_序篇.md"
    else:
        filename = f"戒为良药_第{season_num:03d}季.md"
    
    filepath = os.path.join(OUTPUT_DIR, filename)
    
    if season_num == 0:
        header = f"# 戒为良药 - {title}\n\n"
    else:
        header = f"# 戒为良药 第{season_num}季：{title}\n\n"
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(header)
        f.write(content)
        f.write('\n')
    
    return filepath


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    total = len(SEASONS)
    success = 0
    failed = []
    
    print(f"Starting to scrape {total} seasons of 戒为良药...")
    print(f"Output directory: {OUTPUT_DIR}")
    print()
    
    for i, s in enumerate(SEASONS):
        season_num = s['season']
        title = s['title']
        url = s['url']
        
        label = f"序篇" if season_num == 0 else f"第{season_num}季"
        print(f"[{i+1}/{total}] Scraping {label}: {title}...")
        
        html = fetch_page(url)
        if html is None:
            failed.append(s)
            print(f"  FAILED: Could not fetch page")
            continue
        
        content = extract_article_text(html)
        
        if len(content) < 100:
            print(f"  WARNING: Content seems too short ({len(content)} chars), saving anyway")
        
        filepath = save_season(season_num, title, content)
        size_kb = os.path.getsize(filepath) / 1024
        print(f"  Saved: {os.path.basename(filepath)} ({size_kb:.1f} KB)")
        success += 1
        
        # Be polite - don't hammer the server
        time.sleep(0.5)
    
    print()
    print(f"=== Scraping Complete ===")
    print(f"Success: {success}/{total}")
    if failed:
        print(f"Failed ({len(failed)}):")
        for f in failed:
            print(f"  - Season {f['season']}: {f['title']}")
    
    # Save a summary index
    index_path = os.path.join(OUTPUT_DIR, "戒为良药_目录.md")
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write("# 戒为良药 - 完整目录\n\n")
        f.write(f"共 {total} 篇\n\n")
        for s in SEASONS:
            sn = s['season']
            if sn == 0:
                f.write(f"- [序篇：{s['title']}](戒为良药_序篇.md)\n")
            else:
                f.write(f"- [第{sn}季：{s['title']}](戒为良药_第{sn:03d}季.md)\n")
    print(f"Index saved: {index_path}")


if __name__ == '__main__':
    main()
