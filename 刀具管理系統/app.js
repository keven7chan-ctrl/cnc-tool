/**
 * Web CNC 刀具與製程管理系統 (CNC Tool & Process Management System)
 * Core Application Engine
 */

(function () {
    'use strict';

    // --- DEFAULT INITIAL STATE ---
    const DEFAULT_CUSTOM_FIELDS = [
        { key: 'supplier', label: '供應商', type: 'text', unit: '', options: '' },
        { key: 'last_calibration', label: '最近對刀/校正日期', type: 'date', unit: '', options: '' },
        { key: 'unit_price', label: '刀具單價', type: 'number', unit: 'NTD', options: '' }
    ];

    const DEFAULT_MASTER_TOOLS = [
        {
            id: 'T-EM-010',
            name: 'D10 4刃極細微粒鎢鋼立銑刀',
            type: '立銑刀',
            d: 10.0,
            l: 75.0,
            z: 4,
            material: '硬質合金 (Carbide)',
            coating: 'AlCrN',
            rpm: 5200,
            feed: 1250,
            fz: 0.06,
            coolant: '水溶性切削液',
            stock: 12,
            safety: 4,
            status: '在庫',
            customData: { supplier: '住友 Sumitomo', last_calibration: '2026-09-20', unit_price: 1800 }
        },
        {
            id: 'T-EM-006',
            name: 'D6 4刃高硬度立銑刀',
            type: '立銑刀',
            d: 6.0,
            l: 60.0,
            z: 4,
            material: '硬質合金 (Carbide)',
            coating: 'TiAlN',
            rpm: 8000,
            feed: 1400,
            fz: 0.044,
            coolant: '水溶性切削液',
            stock: 8,
            safety: 5,
            status: '在庫',
            customData: { supplier: 'OSG', last_calibration: '2026-09-18', unit_price: 1200 }
        },
        {
            id: 'T-BM-008',
            name: 'D8 R4 2刃球頭銑刀 (曲面精加工)',
            type: '球頭銑刀',
            d: 8.0,
            l: 80.0,
            z: 2,
            material: '硬質合金 (Carbide)',
            coating: 'DLC 鍍膜',
            rpm: 6500,
            feed: 1100,
            fz: 0.08,
            coolant: '高壓吹氣',
            stock: 2,
            safety: 3,
            status: '需補貨',
            customData: { supplier: 'NS Tool', last_calibration: '2026-09-15', unit_price: 2400 }
        },
        {
            id: 'T-DR-085',
            name: 'D8.5 硬質合金內冷鑽頭',
            type: '鑽頭',
            d: 8.5,
            l: 110.0,
            z: 2,
            material: '鎢鋼內冷 (Coolant-through)',
            coating: 'TiN',
            rpm: 3400,
            feed: 680,
            fz: 0.10,
            coolant: '水溶性切削液',
            stock: 15,
            safety: 5,
            status: '在庫',
            customData: { supplier: 'Seco', last_calibration: '2026-09-22', unit_price: 2100 }
        },
        {
            id: 'T-TAP-M10',
            name: 'M10x1.5 螺旋攻牙絲攻 (通孔/盲孔)',
            type: '絲攻/攻牙刀',
            d: 10.0,
            l: 75.0,
            z: 3,
            material: '粉末高速鋼 (HSS-E)',
            coating: 'TiCN',
            rpm: 500,
            feed: 750,
            fz: 1.5,
            coolant: '切削油',
            stock: 6,
            safety: 2,
            status: '在庫',
            customData: { supplier: 'YAMAWA', last_calibration: '2026-09-10', unit_price: 650 }
        },
        {
            id: 'T-FM-050',
            name: 'D50 4刃捨棄式面銑刀盤',
            type: '面銑刀',
            d: 50.0,
            l: 40.0,
            z: 4,
            material: '合金鋼刀頭 + 鎢鋼刀片',
            coating: '無',
            rpm: 1800,
            feed: 1440,
            fz: 0.20,
            coolant: '微量潤滑 (MQL)',
            stock: 3,
            safety: 1,
            status: '使用中',
            customData: { supplier: 'Sandvik Coromant', last_calibration: '2026-09-01', unit_price: 8500 }
        }
    ];

    const DEFAULT_HIERARCHY = [
        {
            id: 'mach-1',
            name: 'VMC-850A (立式加工中心)',
            type: 'machine',
            children: [
                {
                    id: 'part-101',
                    name: 'Part-A101_OP10 (航太鋁合金支架粗精加工)',
                    type: 'part',
                    parentId: 'mach-1',
                    slots: [
                        { slotNo: 'T01', offsetH: 1, offsetD: 1, toolId: 'T-FM-050', overhangL: 45, comment: '工件頂面粗銑開粗' },
                        { slotNo: 'T02', offsetH: 2, offsetD: 2, toolId: 'T-EM-010', overhangL: 35, comment: '外形階梯粗銑及精銑' },
                        { slotNo: 'T03', offsetH: 3, offsetD: 3, toolId: 'T-DR-085', overhangL: 50, comment: 'M10 螺紋底孔鑽削' },
                        { slotNo: 'T04', offsetH: 4, offsetD: 4, toolId: 'T-TAP-M10', overhangL: 40, comment: 'M10x1.5 剛性攻牙' }
                    ]
                },
                {
                    id: 'part-102',
                    name: 'Part-A101_OP20 (反面精銑與去毛刺)',
                    type: 'part',
                    parentId: 'mach-1',
                    slots: [
                        { slotNo: 'T01', offsetH: 1, offsetD: 1, toolId: 'T-EM-006', overhangL: 30, comment: '反面口袋精銑' }
                    ]
                }
            ]
        },
        {
            id: 'mach-2',
            name: '5-Axis-01 (DMG MORI 五軸加工機)',
            type: 'machine',
            children: [
                {
                    id: 'part-201',
                    name: 'Impeller-B500_OP10 (鈦合金葉輪五軸葉片開粗)',
                    type: 'part',
                    parentId: 'mach-2',
                    slots: [
                        { slotNo: 'T01', offsetH: 1, offsetD: 1, toolId: 'T-BM-008', overhangL: 55, comment: '五軸曲面流道清角精銑' }
                    ]
                }
            ]
        },
        {
            id: 'mach-3',
            name: 'Lathe-CNC-02 (臥式車削中心)',
            type: 'machine',
            children: []
        }
    ];

    // --- APPLICATION STATE ---
    let state = {
        masterTools: JSON.parse(localStorage.getItem('cnc_master_tools')) || DEFAULT_MASTER_TOOLS,
        customFields: JSON.parse(localStorage.getItem('cnc_custom_fields')) || DEFAULT_CUSTOM_FIELDS,
        hierarchy: JSON.parse(localStorage.getItem('cnc_hierarchy')) || DEFAULT_HIERARCHY,
        collapsedNodes: {},
        selectedSetupId: null,
        activeTab: 'tab-master',
        searchQuery: '',
        typeFilter: '',
        stockFilter: ''
    };

    // Save state to LocalStorage
    function saveState() {
        localStorage.setItem('cnc_master_tools', JSON.stringify(state.masterTools));
        localStorage.setItem('cnc_custom_fields', JSON.stringify(state.customFields));
        localStorage.setItem('cnc_hierarchy', JSON.stringify(state.hierarchy));
    }

    // --- INITIALIZATION ---
    document.addEventListener('DOMContentLoaded', () => {
        initUI();
        renderAll();
        setupEventListeners();
    });

    function initUI() {
        lucide.createIcons();
    }

    function renderAll() {
        renderHierarchyTree();
        renderMasterToolTable();
        renderPartSetupTab();
        renderCustomFieldsTable();
        updateBadgesAndCounters();
        populateMachineStatusSelects();
        populateDiffSelects();
        lucide.createIcons();
    }

    // --- TAB SWITCHING ---
    function setupEventListeners() {
        // Tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetTab = btn.getAttribute('data-tab');
                switchTab(targetTab);
            });
        });

        // Search and Filters
        const searchInput = document.getElementById('globalSearchInput');
        const clearBtn = document.getElementById('clearSearchBtn');
        searchInput.addEventListener('input', (e) => {
            state.searchQuery = e.target.value.trim().toLowerCase();
            clearBtn.classList.toggle('hidden', state.searchQuery === '');
            renderMasterToolTable();
            renderPartSetupTab();
            renderPresetterTab();
        });

        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            state.searchQuery = '';
            clearBtn.classList.add('hidden');
            renderMasterToolTable();
            renderPartSetupTab();
            renderPresetterTab();
        });

        document.getElementById('typeFilterSelect').addEventListener('change', (e) => {
            state.typeFilter = e.target.value;
            renderMasterToolTable();
        });

        document.getElementById('stockFilterSelect').addEventListener('change', (e) => {
            state.stockFilter = e.target.value;
            renderMasterToolTable();
        });

        // Reset Demo Data
        document.getElementById('resetDemoDataBtn').addEventListener('click', () => {
            if (confirm('確定要重置所有資料為系統預設範例？自訂的刀具與欄位將被覆蓋。')) {
                state.masterTools = DEFAULT_MASTER_TOOLS;
                state.customFields = DEFAULT_CUSTOM_FIELDS;
                state.hierarchy = DEFAULT_HIERARCHY;
                state.selectedSetupId = null;
                saveState();
                renderAll();
                alert('系統資料已重置為標準範例！');
            }
        });

        // Export Excel
        document.getElementById('exportExcelBtn').addEventListener('click', exportToExcel);

        // Export PDF
        document.getElementById('exportPdfBtn').addEventListener('click', exportToPdf);

        // Modals listeners
        setupModalListeners();

        // Speed & Feed Calculator listener
        setupCalculatorListeners();

        // Add machine button
        document.getElementById('addMachineBtn').addEventListener('click', () => {
            openNodeModal('machine');
        });

        // Expand / Collapse All Tree button
        document.getElementById('expandAllTreeBtn').addEventListener('click', () => {
            const allMachineIds = state.hierarchy.map(m => m.id);
            const hasUncollapsed = allMachineIds.some(id => !state.collapsedNodes[id]);
            allMachineIds.forEach(id => {
                state.collapsedNodes[id] = hasUncollapsed;
            });
            renderHierarchyTree();
        });

        // Add Tool Slot button
        const addSlotBtn = document.getElementById('addToolSlotBtn');
        if (addSlotBtn) {
            addSlotBtn.addEventListener('click', () => {
                window.addToolSlot();
            });
        }

        // Clone Tool Setup button
        const cloneBtn = document.getElementById('cloneSetupBtn');
        if (cloneBtn) {
            cloneBtn.addEventListener('click', () => {
                window.cloneToolSetup();
            });
        }
    }

    function switchTab(tabId) {
        state.activeTab = tabId;
        document.querySelectorAll('.tab-btn').forEach(btn => {
            if (btn.getAttribute('data-tab') === tabId) {
                btn.classList.add('active', 'border-blue-500', 'text-blue-400');
                btn.classList.remove('border-transparent', 'text-slate-400');
            } else {
                btn.classList.remove('active', 'border-blue-500', 'text-blue-400');
                btn.classList.add('border-transparent', 'text-slate-400');
            }
        });

        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('hidden', content.id !== tabId);
        });

        if (tabId === 'tab-machine-status') {
            populateMachineStatusSelects();
            const sel = document.getElementById('machineStatusSelect');
            if (sel && sel.value) renderMachineStatusTable(sel.value);
        }
        if (tabId === 'tab-presetter') {
            populateDiffSelects();
        }
    }

    // --- BADGES & STATS COUNTERS ---
    function updateBadgesAndCounters() {
        document.getElementById('masterBadge').textContent = state.masterTools.length;
        document.getElementById('statTotalTools').textContent = state.masterTools.length;
        
        const lowStockCount = state.masterTools.filter(t => t.stock <= t.safety || t.status === '需補貨').length;
        document.getElementById('statLowStock').textContent = lowStockCount;

        document.getElementById('customFieldsBadge').textContent = state.customFields.length;

        // Machine count & bound tool count
        let mCount = state.hierarchy.length;
        let boundCount = 0;
        state.hierarchy.forEach(m => {
            (m.children || []).forEach(p => {
                boundCount += (p.slots || []).filter(s => s.toolId).length;
            });
        });
        document.getElementById('machineCount').textContent = mCount;
        document.getElementById('boundToolCount').textContent = boundCount;

        // Selected setup info tag
        const currentSelTag = document.getElementById('currentSelectionInfo');
        const setupBadge = document.getElementById('selectedSetupBadge');

        if (state.selectedSetupId) {
            const nodeInfo = findPartNodeById(state.selectedSetupId);
            if (nodeInfo) {
                currentSelTag.textContent = `目前檢視工件: ${nodeInfo.part.name}`;
                setupBadge.textContent = nodeInfo.part.name.split(' ')[0];
                setupBadge.classList.remove('hidden');
            }
        } else {
            currentSelTag.textContent = '目前檢視: 全區刀具總表';
            setupBadge.classList.add('hidden');
        }
    }

    // --- TAB 1: 刀具總表 (MASTER TOOL LIBRARY) ---
    function renderMasterToolTable() {
        const tbody = document.getElementById('masterToolTableBody');
        const headerMarker = document.getElementById('dynamicColHeaderMarker');

        // Dynamically build Custom Field Headers
        // Remove existing dynamic headers
        document.querySelectorAll('.custom-col-header').forEach(el => el.remove());
        
        state.customFields.forEach(cf => {
            const th = document.createElement('th');
            th.className = 'py-3 px-3 custom-col-header text-slate-300';
            th.textContent = `${cf.label} ${cf.unit ? '(' + cf.unit + ')' : ''}`;
            headerMarker.parentNode.insertBefore(th, headerMarker);
        });

        // Filter tools
        let filtered = state.masterTools.filter(tool => {
            const matchSearch = !state.searchQuery || 
                tool.id.toLowerCase().includes(state.searchQuery) ||
                tool.name.toLowerCase().includes(state.searchQuery) ||
                tool.type.toLowerCase().includes(state.searchQuery) ||
                (tool.material && tool.material.toLowerCase().includes(state.searchQuery)) ||
                (tool.coating && tool.coating.toLowerCase().includes(state.searchQuery));

            const matchType = !state.typeFilter || tool.type === state.typeFilter;
            const matchStock = !state.stockFilter || tool.status === state.stockFilter;

            return matchSearch && matchType && matchStock;
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="${11 + state.customFields.length}" class="py-12 text-center text-slate-500">
                        <i data-lucide="inbox" class="w-10 h-10 mx-auto mb-2 opacity-50"></i>
                        <p>未找到符合條件的刀具</p>
                    </td>
                </tr>
            `;
            lucide.createIcons();
            return;
        }

        tbody.innerHTML = filtered.map(t => {
            // Status Badge CSS
            let statusBadgeClass = 'bg-slate-700 text-slate-300';
            if (t.status === '在庫') statusBadgeClass = 'bg-emerald-950 text-emerald-400 border border-emerald-800/60';
            else if (t.status === '使用中') statusBadgeClass = 'bg-blue-950 text-blue-400 border border-blue-800/60';
            else if (t.status === '需補貨') statusBadgeClass = 'bg-amber-950 text-amber-400 border border-amber-800/60';
            else if (t.status === '報廢' || t.status === '修磨中') statusBadgeClass = 'bg-red-950 text-red-400 border border-red-800/60';

            // Dynamic custom cells
            const customCellsHtml = state.customFields.map(cf => {
                const val = (t.customData && t.customData[cf.key] !== undefined) ? t.customData[cf.key] : '-';
                return `<td class="py-3 px-3 font-mono text-xs text-slate-300">${val}</td>`;
            }).join('');

            return `
                <tr class="hover:bg-slate-800/70 transition group">
                    <td class="py-3 px-3 text-center cursor-grab" title="可拖曳至刀槽">
                        <i data-lucide="grip-vertical" class="w-4 h-4 text-slate-600 group-hover:text-blue-400 inline-block"></i>
                    </td>
                    <td class="py-3 px-3 font-mono font-bold text-cyan-400">${t.id}</td>
                    <td class="py-3 px-3 font-semibold text-slate-100">${t.name}</td>
                    <td class="py-3 px-3">
                        <span class="bg-slate-700/70 text-slate-300 px-2 py-0.5 rounded text-xs">${t.type}</span>
                    </td>
                    <td class="py-3 px-3 text-right font-mono text-slate-200">D${t.d}</td>
                    <td class="py-3 px-3 text-right font-mono text-slate-300">${t.l || '-'}</td>
                    <td class="py-3 px-3 text-center font-mono text-slate-300">${t.z || '-'}</td>
                    <td class="py-3 px-3 text-xs">
                        <div class="text-slate-200">${t.material || 'Carbide'}</div>
                        <div class="text-slate-400 font-mono text-[11px]">${t.coating || '無'}</div>
                    </td>
                    <td class="py-3 px-3 font-mono text-xs">
                        <div class="text-blue-300 font-bold">${t.rpm ? t.rpm + ' RPM' : '-'}</div>
                        <div class="text-slate-400">F: ${t.feed || '-'} | fz: ${t.fz || '-'}</div>
                    </td>
                    <td class="py-3 px-3">
                        <div class="flex items-center gap-1.5 mb-1">
                            <span class="px-2 py-0.5 rounded text-xs font-medium ${statusBadgeClass}">${t.status}</span>
                        </div>
                        <div class="text-xs text-slate-400 font-mono">庫存: <strong class="text-slate-200">${t.stock}</strong> (安全: ${t.safety})</div>
                    </td>
                    ${customCellsHtml}
                    <td class="py-3 px-3 text-center">
                        <div class="flex items-center justify-center gap-1">
                            <button onclick="window.editTool('${t.id}')" class="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded transition" title="編輯刀具">
                                <i data-lucide="edit-3" class="w-4 h-4"></i>
                            </button>
                            <button onclick="window.deleteTool('${t.id}')" class="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition" title="刪除刀具">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        lucide.createIcons();
    }

    // --- TAB 2: 機台與工件配刀階層 (HIERARCHY TREE & PART SETUP) ---
    function renderHierarchyTree() {
        const container = document.getElementById('hierarchyTree');
        if (!container) return;

        container.innerHTML = state.hierarchy.map(machine => {
            const isCollapsed = !!state.collapsedNodes[machine.id];
            const hasChildren = machine.children && machine.children.length > 0;

            const childrenHtml = hasChildren ? machine.children.map(part => {
                const isActive = state.selectedSetupId === part.id;
                const slotCount = (part.slots || []).length;
                const boundToolsCount = (part.slots || []).filter(s => s.toolId).length;

                return `
                    <div class="tree-node-content ml-5 p-2 rounded-lg border border-transparent cursor-pointer flex items-center justify-between text-xs font-medium ${isActive ? 'active' : 'text-slate-300 hover:text-white'} group/part"
                         onclick="window.selectPartSetup('${part.id}')">
                        <div class="flex items-center gap-2 truncate flex-1 min-w-0">
                            <i data-lucide="file-cog" class="w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-slate-400'} flex-shrink-0"></i>
                            <span class="truncate">${part.name}</span>
                        </div>
                        <div class="flex items-center gap-1 flex-shrink-0">
                            <span class="bg-slate-900/80 px-1.5 py-0.5 rounded text-[10px] font-mono text-cyan-400 border border-slate-700">
                                ${boundToolsCount}/${slotCount}刀
                            </span>
                            <div class="hidden group-hover/part:flex items-center gap-0.5 ml-1" onclick="event.stopPropagation()">
                                <button title="編輯工件" onclick="window.openPartEditModal('${part.id}')" class="p-0.5 text-slate-500 hover:text-blue-400 hover:bg-slate-700 rounded">
                                    <i data-lucide="edit-3" class="w-3 h-3"></i>
                                </button>
                                <button title="複製刀具表" onclick="window.openCloneModal('${part.id}')" class="p-0.5 text-slate-500 hover:text-cyan-400 hover:bg-slate-700 rounded">
                                    <i data-lucide="copy" class="w-3 h-3"></i>
                                </button>
                                <button title="刪除工件" onclick="window.deletePart('${part.id}')" class="p-0.5 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded">
                                    <i data-lucide="trash" class="w-3 h-3"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('') : `<div class="ml-6 py-1 text-xs text-slate-500 italic">尚無工件專案</div>`;

            return `
                <div class="space-y-1 mb-2">
                    <!-- Machine Level 1 -->
                    <div class="p-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg border border-slate-700 flex items-center justify-between group cursor-pointer"
                         onclick="window.toggleNodeCollapse('${machine.id}', event)">
                        <div class="flex items-center gap-2 text-slate-100 font-bold text-xs truncate">
                            <i data-lucide="${isCollapsed ? 'chevron-right' : 'chevron-down'}" class="w-4 h-4 text-slate-400 flex-shrink-0"></i>
                            <i data-lucide="monitor" class="w-4 h-4 text-cyan-400 flex-shrink-0"></i>
                            <span class="truncate">${machine.name}</span>
                        </div>
                        <button onclick="event.stopPropagation(); window.openNodeModal('part', '${machine.id}')" title="新增工件/工序" 
                                class="p-1 opacity-60 group-hover:opacity-100 hover:text-blue-400 hover:bg-slate-600 rounded transition">
                            <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                        </button>
                    </div>
                    <!-- Part Level 2 -->
                    <div class="space-y-1 pl-1 ${isCollapsed ? 'hidden' : ''}">
                        ${childrenHtml}
                    </div>
                </div>
            `;
        }).join('');

        lucide.createIcons();
    }

    window.toggleNodeCollapse = function (machineId, event) {
        if (event) event.stopPropagation();
        state.collapsedNodes[machineId] = !state.collapsedNodes[machineId];
        renderHierarchyTree();
    };

    function findPartNodeById(id) {
        for (const m of state.hierarchy) {
            for (const p of (m.children || [])) {
                if (p.id === id) {
                    return { machine: m, part: p };
                }
            }
        }
        return null;
    }

    window.selectPartSetup = function (partId) {
        state.selectedSetupId = partId;
        renderHierarchyTree();
        renderPartSetupTab();
        updateBadgesAndCounters();

        // Auto switch to Part Tooling tab if on Master tab
        if (state.activeTab === 'tab-master') {
            switchTab('tab-hierarchy');
        }
    };

    window.deletePart = function (partId) {
        const nodeInfo = findPartNodeById(partId);
        if (!nodeInfo) return;
        if (!confirm(`確定要刪除工件「${nodeInfo.part.name}」？此工件所有刀槽配置將一併移除。`)) return;

        nodeInfo.machine.children = nodeInfo.machine.children.filter(p => p.id !== partId);
        if (state.selectedSetupId === partId) state.selectedSetupId = null;

        saveState();
        renderHierarchyTree();
        renderPartSetupTab();
        updateBadgesAndCounters();
        populateMachineStatusSelects();
        populateDiffSelects();
    };

    window.openPartEditModal = function (partId) {
        const nodeInfo = findPartNodeById(partId);
        if (!nodeInfo) return;

        document.getElementById('partEditId').value = partId;
        document.getElementById('partEditName').value = nodeInfo.part.name;

        // Populate machine dropdown
        const machSel = document.getElementById('partEditMachine');
        machSel.innerHTML = state.hierarchy.map(m =>
            `<option value="${m.id}" ${m.id === nodeInfo.machine.id ? 'selected' : ''}>${m.name}</option>`
        ).join('');

        document.getElementById('partEditModal').classList.remove('hidden');
    };

    function renderPartSetupTab() {
        const titleEl = document.getElementById('setupTitle');
        const subTitleEl = document.getElementById('setupSubTitle');
        const slotList = document.getElementById('partSlotList');
        const quickList = document.getElementById('quickToolList');

        // Always render quick picker list on right side
        renderQuickToolPicker();

        if (!state.selectedSetupId) {
            titleEl.textContent = '請從左側點擊選擇工件/工序 (Part/OP)';
            subTitleEl.textContent = '目前未選取工件加工專案。點選左側樹狀節點開始配置刀位 (T01-T24)';
            slotList.innerHTML = `
                <div class="py-16 text-center text-slate-500">
                    <i data-lucide="arrow-left-circle" class="w-12 h-12 mx-auto mb-3 opacity-40 animate-pulse"></i>
                    <p class="text-sm font-medium">請在左側導覽樹點選「機台 → 工件料號」</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        const nodeInfo = findPartNodeById(state.selectedSetupId);
        if (!nodeInfo) return;

        const { machine, part } = nodeInfo;
        titleEl.textContent = `${machine.name} ➔ ${part.name}`;
        subTitleEl.textContent = `目前已配置 ${(part.slots || []).length} 個刀位 (可將右側刀具拖放至下方刀槽)`;

        if (!part.slots || part.slots.length === 0) {
            slotList.innerHTML = `
                <div class="py-12 text-center text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
                    <p class="text-sm mb-2">此工件目前尚未建立刀槽</p>
                    <button onclick="window.addToolSlot()" class="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium">
                        新增第一個刀槽 (T01)
                    </button>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        // Render slots with Drag & Drop target capability
        slotList.innerHTML = part.slots.map((slot, idx) => {
            const masterTool = state.masterTools.find(t => t.id === slot.toolId);

            let toolContentHtml = '';
            if (masterTool) {
                toolContentHtml = `
                    <div class="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2 items-center bg-slate-900/90 p-2.5 rounded-lg border border-slate-700">
                        <div>
                            <div class="text-xs font-mono font-bold text-cyan-400">${masterTool.id}</div>
                            <div class="text-xs font-semibold text-slate-200 truncate">${masterTool.name}</div>
                        </div>
                        <div class="text-xs font-mono text-slate-300">
                            <div>外徑: D${masterTool.d}mm</div>
                            <div class="text-slate-400 text-[11px]">材質: ${masterTool.material || 'Carbide'}</div>
                        </div>
                        <div class="text-xs font-mono text-slate-300">
                            <div class="text-blue-300 font-bold">${masterTool.rpm ? masterTool.rpm + ' RPM' : '-'}</div>
                            <div class="text-slate-400">進給 F: ${masterTool.feed || '-'}</div>
                        </div>
                        <div class="flex items-center justify-end gap-2">
                            <button onclick="window.unbindSlotTool('${slot.slotNo}')" class="text-xs text-red-400 hover:text-red-300 bg-red-950/60 hover:bg-red-900/80 border border-red-800/80 px-2 py-1 rounded transition">
                                解除綁定
                            </button>
                        </div>
                    </div>
                `;
            } else {
                toolContentHtml = `
                    <div class="flex-1 flex items-center justify-between bg-slate-900/40 p-2.5 rounded-lg border border-dashed border-slate-700 text-slate-500 text-xs">
                        <span>未綁定刀具 (空刀位) - 可從右側拖曳刀具至此處</span>
                        <select onchange="window.bindSlotTool('${slot.slotNo}', this.value)" class="bg-slate-800 text-slate-300 text-xs rounded border border-slate-700 px-2 py-1 focus:outline-none">
                            <option value="">-- 手動選擇刀具 --</option>
                            ${state.masterTools.map(mt => `<option value="${mt.id}">${mt.id} - ${mt.name} (D${mt.d})</option>`).join('')}
                        </select>
                    </div>
                `;
            }

            return `
                <div class="slot-card bg-slate-800/90 p-3 rounded-xl border border-slate-700 hover:border-blue-500/60 transition space-y-2.5"
                     data-slot-no="${slot.slotNo}"
                     ondragover="window.handleSlotDragOver(event)"
                     ondragleave="window.handleSlotDragLeave(event)"
                     ondrop="window.handleSlotDrop(event, '${slot.slotNo}')">
                    
                    <div class="flex items-center justify-between border-b border-slate-700/60 pb-2">
                        <div class="flex items-center gap-3">
                            <span class="w-8 h-8 rounded-lg bg-blue-600 text-white font-mono font-bold flex items-center justify-center text-sm shadow">
                                ${slot.slotNo}
                            </span>
                            <div class="flex items-center gap-4 text-xs font-mono">
                                <div><span class="text-slate-400">長度補償 H:</span> <strong class="text-cyan-300">H${slot.offsetH || idx + 1}</strong></div>
                                <div><span class="text-slate-400">刀徑補償 D:</span> <strong class="text-cyan-300">D${slot.offsetD || idx + 1}</strong></div>
                                <div><span class="text-slate-400">凸出長度:</span> <input type="number" value="${slot.overhangL || 35}" onchange="window.updateSlotOverhang('${slot.slotNo}', this.value)" class="w-14 bg-slate-900 text-slate-200 border border-slate-700 rounded px-1 py-0.5 text-center text-xs"> mm</div>
                            </div>
                        </div>

                        <div class="flex items-center gap-1">
                            <button onclick="window.removeSlot('${slot.slotNo}')" title="刪除刀槽" class="p-1 text-slate-400 hover:text-red-400 rounded">
                                <i data-lucide="trash" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Slot Tool Content Area -->
                    ${toolContentHtml}

                    <div class="flex items-center gap-2">
                        <i data-lucide="message-square" class="w-3.5 h-3.5 text-slate-500"></i>
                        <input type="text" value="${slot.comment || ''}" placeholder="新增加工備註 (例: 開粗留 0.2mm 精修餘量)..."
                               onchange="window.updateSlotComment('${slot.slotNo}', this.value)"
                               class="flex-1 bg-slate-900/60 border border-slate-700/60 rounded px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-blue-500">
                    </div>
                </div>
            `;
        }).join('');

        lucide.createIcons();
    }

    // --- QUICK MASTER TOOL PICKER & DRAG SYSTEM ---
    function renderQuickToolPicker() {
        const container = document.getElementById('quickToolList');
        if (!container) return;

        const filterInput = document.getElementById('quickPickerSearch');
        const q = filterInput ? filterInput.value.trim().toLowerCase() : '';

        const list = state.masterTools.filter(t => !q || t.id.toLowerCase().includes(q) || t.name.toLowerCase().includes(q));

        container.innerHTML = list.map(t => {
            return `
                <div class="p-2.5 bg-slate-900/90 rounded-lg border border-slate-700/80 hover:border-blue-500 cursor-grab active:cursor-grabbing transition group flex items-center justify-between"
                     draggable="true"
                     ondragstart="window.handleToolDragStart(event, '${t.id}')">
                    <div class="truncate">
                        <div class="flex items-center gap-1.5">
                            <i data-lucide="grip-vertical" class="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400"></i>
                            <span class="font-mono font-bold text-xs text-cyan-400">${t.id}</span>
                            <span class="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded">${t.type}</span>
                        </div>
                        <div class="text-xs text-slate-200 truncate pl-5">${t.name}</div>
                    </div>
                    <div class="text-right font-mono text-xs text-slate-400 flex-shrink-0">
                        <div>D${t.d}</div>
                    </div>
                </div>
            `;
        }).join('');

        lucide.createIcons();

        if (filterInput && !filterInput.hasListener) {
            filterInput.hasListener = true;
            filterInput.addEventListener('input', renderQuickToolPicker);
        }
    }

    // Drag and Drop Event Handlers
    window.handleToolDragStart = function (e, toolId) {
        e.dataTransfer.setData('text/plain', toolId);
        e.dataTransfer.effectAllowed = 'copy';
    };

    window.handleSlotDragOver = function (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        e.currentTarget.classList.add('drag-over');
    };

    window.handleSlotDragLeave = function (e) {
        e.currentTarget.classList.remove('drag-over');
    };

    window.handleSlotDrop = function (e, slotNo) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        const toolId = e.dataTransfer.getData('text/plain');
        if (toolId) {
            window.bindSlotTool(slotNo, toolId);
        }
    };

    // Slot Modification helpers
    window.addToolSlot = function () {
        if (!state.selectedSetupId) {
            alert('請先在左側樹狀選單選擇要新增刀槽的工件/工序 (Part/OP)');
            return;
        }
        const nodeInfo = findPartNodeById(state.selectedSetupId);
        if (!nodeInfo) return;

        const part = nodeInfo.part;
        part.slots = part.slots || [];
        const nextIdx = part.slots.length + 1;
        const slotNo = 'T' + (nextIdx < 10 ? '0' + nextIdx : nextIdx);

        part.slots.push({
            slotNo: slotNo,
            offsetH: nextIdx,
            offsetD: nextIdx,
            toolId: '',
            overhangL: 35,
            comment: ''
        });

        saveState();
        renderPartSetupTab();
        renderHierarchyTree();
    };

    window.removeSlot = function (slotNo) {
        if (!state.selectedSetupId) return;
        const nodeInfo = findPartNodeById(state.selectedSetupId);
        if (!nodeInfo) return;

        nodeInfo.part.slots = nodeInfo.part.slots.filter(s => s.slotNo !== slotNo);
        saveState();
        renderPartSetupTab();
        renderHierarchyTree();
    };

    window.bindSlotTool = function (slotNo, toolId) {
        if (!state.selectedSetupId) return;
        const nodeInfo = findPartNodeById(state.selectedSetupId);
        if (!nodeInfo) return;

        const slot = nodeInfo.part.slots.find(s => s.slotNo === slotNo);
        if (slot) {
            slot.toolId = toolId;
            saveState();
            renderPartSetupTab();
            renderHierarchyTree();
            updateBadgesAndCounters();
        }
    };

    window.unbindSlotTool = function (slotNo) {
        window.bindSlotTool(slotNo, '');
    };

    window.updateSlotOverhang = function (slotNo, val) {
        if (!state.selectedSetupId) return;
        const nodeInfo = findPartNodeById(state.selectedSetupId);
        if (!nodeInfo) return;
        const slot = nodeInfo.part.slots.find(s => s.slotNo === slotNo);
        if (slot) {
            slot.overhangL = parseFloat(val) || 35;
            saveState();
        }
    };

    window.updateSlotComment = function (slotNo, val) {
        if (!state.selectedSetupId) return;
        const nodeInfo = findPartNodeById(state.selectedSetupId);
        if (!nodeInfo) return;
        const slot = nodeInfo.part.slots.find(s => s.slotNo === slotNo);
        if (slot) {
            slot.comment = val;
            saveState();
        }
    };

    // CLONE TOOL TABLE (複製加工刀具表) - 開啟複製 Modal
    window.openCloneModal = function (sourcePartId) {
        const srcId = sourcePartId || state.selectedSetupId;
        if (!srcId) {
            alert('請先在左側選取要作為複製來源的工件專案 (Part/OP)');
            return;
        }
        const sourceNode = findPartNodeById(srcId);
        if (!sourceNode) return;

        document.getElementById('cloneSourceInfo').textContent =
            `來源工件：${sourceNode.part.name}  (機台: ${sourceNode.machine.name})`;
        document.getElementById('cloneNewPartName').value = sourceNode.part.name + '_COPY';

        // Populate machine options
        const sel = document.getElementById('cloneTargetMachine');
        sel.innerHTML = state.hierarchy.map(m =>
            `<option value="${m.id}" ${m.id === sourceNode.machine.id ? 'selected' : ''}>${m.name}</option>`
        ).join('');

        // Store source part id
        document.getElementById('cloneModal').dataset.srcPartId = srcId;
        document.getElementById('cloneModal').classList.remove('hidden');
    };

    window.cloneToolSetup = function () {
        window.openCloneModal(state.selectedSetupId);
    };

    // --- TAB 3: 機器現況刀具表 (MACHINE STATUS TABLE) ---
    function populateMachineStatusSelects() {
        const sel = document.getElementById('machineStatusSelect');
        if (!sel) return;
        const prev = sel.value;
        sel.innerHTML = '<option value="">―― 請選擇機台 ――</option>' +
            state.hierarchy.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
        if (prev) sel.value = prev;
    }

    function renderMachineStatusTable(machineId) {
        const tbody = document.getElementById('machineStatusTableBody');
        const summaryEl = document.getElementById('machineStatusSummary');
        if (!tbody) return;

        if (!machineId) {
            tbody.innerHTML = '<tr><td colspan="12" class="py-12 text-center text-slate-500">請選擇機台以顯示現況刀具表</td></tr>';
            if (summaryEl) summaryEl.textContent = '';
            return;
        }

        const machine = state.hierarchy.find(m => m.id === machineId);
        if (!machine) return;

        const parts = machine.children || [];
        if (parts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="12" class="py-10 text-center text-slate-500">此機台目前無工件/工序配置</td></tr>';
            if (summaryEl) summaryEl.textContent = '';
            return;
        }

        let totalSlots = 0, boundSlots = 0;
        let rows = [];

        parts.forEach(part => {
            const slots = part.slots || [];
            if (slots.length === 0) return;

            slots.forEach((slot, idx) => {
                const mt = state.masterTools.find(t => t.id === slot.toolId);
                totalSlots++;
                if (mt) boundSlots++;

                let statusClass = 'bg-slate-700 text-slate-300';
                if (mt) {
                    if (mt.status === '在庫') statusClass = 'bg-emerald-950 text-emerald-400';
                    else if (mt.status === '使用中') statusClass = 'bg-blue-950 text-blue-400';
                    else if (mt.status === '需補貨') statusClass = 'bg-amber-950 text-amber-400';
                    else statusClass = 'bg-red-950 text-red-400';
                }

                const partNameCell = idx === 0
                    ? `<td rowspan="${slots.length}" class="py-2.5 px-3 text-xs font-semibold text-slate-200 bg-slate-800/60 align-top border-r border-slate-700">${part.name}</td>`
                    : '';

                rows.push(`
                    <tr class="hover:bg-slate-800/50 transition ${idx === 0 ? 'border-t-2 border-slate-600' : ''}">
                        ${partNameCell}
                        <td class="py-2.5 px-3 font-bold text-blue-400 font-mono">${slot.slotNo}</td>
                        <td class="py-2.5 px-3 font-mono text-xs text-cyan-300">H${slot.offsetH}/D${slot.offsetD}</td>
                        <td class="py-2.5 px-3 font-mono font-bold text-amber-300 text-xs">${mt ? mt.id : '<span class="text-slate-600">未綁定</span>'}</td>
                        <td class="py-2.5 px-3 text-xs text-slate-200">${mt ? mt.name : '-'}</td>
                        <td class="py-2.5 px-3">${mt ? `<span class="bg-slate-700/70 text-slate-300 px-1.5 py-0.5 rounded text-xs">${mt.type}</span>` : '-'}</td>
                        <td class="py-2.5 px-3 text-right font-mono text-xs">${mt ? 'D' + mt.d : '-'}</td>
                        <td class="py-2.5 px-3 text-right font-mono text-xs">${slot.overhangL} mm</td>
                        <td class="py-2.5 px-3 text-right font-mono text-xs text-blue-300">${mt ? mt.rpm : '-'}</td>
                        <td class="py-2.5 px-3 text-right font-mono text-xs">${mt ? mt.feed : '-'}</td>
                        <td class="py-2.5 px-3">${mt ? `<span class="px-1.5 py-0.5 rounded text-xs ${statusClass}">${mt.status}</span>` : '-'}</td>
                        <td class="py-2.5 px-3 text-xs text-slate-400">${slot.comment || ''}</td>
                    </tr>
                `);
            });
        });

        tbody.innerHTML = rows.length ? rows.join('') :
            '<tr><td colspan="12" class="py-10 text-center text-slate-500">此機台工件目前皆無刀槽配置</td></tr>';

        if (summaryEl) summaryEl.textContent =
            `共 ${parts.length} 個工件，刀槽 ${boundSlots}/${totalSlots} 已配刀`;
        lucide.createIcons();
    }

    // --- TAB 4: 刀具差異比對表 (DIFF COMPARISON) ---
    function populateDiffSelects() {
        const machSel = document.getElementById('diffMachineSelect');
        if (!machSel) return;
        const prev = machSel.value;
        machSel.innerHTML = '<option value="">―― 請選擇機台 ――</option>' +
            state.hierarchy.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
        if (prev) machSel.value = prev;
    }

    function populateDiffPartSelect(machineId) {
        const partSel = document.getElementById('diffPartSelect');
        if (!partSel) return;
        if (!machineId) {
            partSel.innerHTML = '<option value="">―― 請先選擇機台 ――</option>';
            return;
        }
        // All parts from ALL machines (for comparison target)
        let options = '<option value="">―― 請選擇比對目標工件 ――</option>';
        state.hierarchy.forEach(m => {
            (m.children || []).forEach(p => {
                options += `<option value="${p.id}">[${m.name}] ${p.name}</option>`;
            });
        });
        partSel.innerHTML = options;
    }

    function runDiffComparison() {
        const machineId = document.getElementById('diffMachineSelect').value;
        const targetPartId = document.getElementById('diffPartSelect').value;
        const tbody = document.getElementById('diffTableBody');
        const badgesEl = document.getElementById('diffSummaryBadges');

        if (!machineId || !targetPartId) {
            tbody.innerHTML = '<tr><td colspan="8" class="py-10 text-center text-slate-500">請選擇機台與目標製程工件後執行比對</td></tr>';
            if (badgesEl) badgesEl.innerHTML = '';
            return;
        }

        const machine = state.hierarchy.find(m => m.id === machineId);
        if (!machine) return;

        // Build machine tool set (all bound tools across all parts of this machine)
        const machineTools = new Map(); // toolId -> [{part, slot}]
        (machine.children || []).forEach(part => {
            (part.slots || []).forEach(slot => {
                if (slot.toolId) {
                    if (!machineTools.has(slot.toolId)) machineTools.set(slot.toolId, []);
                    machineTools.get(slot.toolId).push({ part, slot });
                }
            });
        });

        // Build target part tool set
        const targetNode = findPartNodeById(targetPartId);
        if (!targetNode) return;
        const targetTools = new Map(); // toolId -> slot
        (targetNode.part.slots || []).forEach(slot => {
            if (slot.toolId) targetTools.set(slot.toolId, { part: targetNode.part, slot });
        });

        // Union of all toolIds
        const allToolIds = new Set([...machineTools.keys(), ...targetTools.keys()]);

        let sameCount = 0, onlyMachine = 0, onlyTarget = 0;
        let rows = [];

        allToolIds.forEach(toolId => {
            const mt = state.masterTools.find(t => t.id === toolId);
            const inMachine = machineTools.has(toolId);
            const inTarget = targetTools.has(toolId);

            let statusLabel, statusClass, explanation;
            if (inMachine && inTarget) {
                statusLabel = '✓ 共用';
                statusClass = 'bg-emerald-950 text-emerald-400 border border-emerald-800/60';
                explanation = '兩者都使用此刀具';
                sameCount++;
            } else if (inMachine && !inTarget) {
                statusLabel = '− 機台有 / 製程無';
                statusClass = 'bg-blue-950 text-blue-400 border border-blue-800/60';
                explanation = '機台目前裝刀，比對製程不需要';
                onlyMachine++;
            } else {
                statusLabel = '⊕ 製程需要 / 機台無';
                statusClass = 'bg-amber-950 text-amber-400 border border-amber-800/60';
                explanation = '比對製程需要，機台目前未裝';
                onlyTarget++;
            }

            const machineInfo = inMachine
                ? machineTools.get(toolId).map(e => `${e.slot.slotNo}(${e.part.name.split(' ')[0]})`).join(', ')
                : '-';
            const targetInfo = inTarget
                ? `${targetTools.get(toolId).slot.slotNo} (${targetTools.get(toolId).part.name.split(' ')[0]})`
                : '-';

            rows.push(`
                <tr class="hover:bg-slate-800/40 transition">
                    <td class="py-3 px-3">
                        <span class="px-2 py-0.5 rounded text-xs font-medium ${statusClass}">${statusLabel}</span>
                    </td>
                    <td class="py-3 px-3 font-mono text-xs text-slate-300">
                        ${inMachine ? machineTools.get(toolId).map(e => e.slot.slotNo).join(', ') : '-'}
                    </td>
                    <td class="py-3 px-3 font-mono font-bold text-xs text-amber-300">${toolId}</td>
                    <td class="py-3 px-3 text-xs text-slate-200">${mt ? mt.name : toolId}</td>
                    <td class="py-3 px-3 text-right font-mono text-xs">${mt ? 'D' + mt.d : '-'}</td>
                    <td class="py-3 px-3 text-xs text-cyan-300">${machineInfo}</td>
                    <td class="py-3 px-3 text-xs text-purple-300">${targetInfo}</td>
                    <td class="py-3 px-3 text-xs text-slate-400">${explanation}</td>
                </tr>
            `);
        });

        tbody.innerHTML = rows.length ? rows.join('') :
            '<tr><td colspan="8" class="py-10 text-center text-slate-500">機台與比對製程均無刀具綁定資料</td></tr>';

        if (badgesEl) {
            badgesEl.innerHTML = `
                <span class="px-2.5 py-1 rounded-full text-xs bg-emerald-900/60 text-emerald-400 border border-emerald-700">共用: ${sameCount}</span>
                <span class="px-2.5 py-1 rounded-full text-xs bg-blue-900/60 text-blue-400 border border-blue-700">機台獨有: ${onlyMachine}</span>
                <span class="px-2.5 py-1 rounded-full text-xs bg-amber-900/60 text-amber-400 border border-amber-700">製程需要: ${onlyTarget}</span>
            `;
        }
    }

    // --- 領刀/對刀簽核表 (已不再使用，保留空的 renderPresetterTab 避免錯誤) ---
    function renderPresetterTab() {
        // 此 Tab 已改為差異比對表，不需要內容
    }

    // --- TAB 4: 動態自訂欄位 (CUSTOM FIELDS MANAGEMENT) ---
    function renderCustomFieldsTable() {
        const tbody = document.getElementById('customFieldsTableBody');
        if (!tbody) return;

        if (state.customFields.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="py-8 text-center text-slate-500">目前無自訂欄位，點選右上方「新增自訂欄位」即可擴充。</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = state.customFields.map(cf => {
            return `
                <tr class="hover:bg-slate-700/40">
                    <td class="py-3 px-4 font-mono font-bold text-blue-400">${cf.key}</td>
                    <td class="py-3 px-4 font-semibold text-slate-200">${cf.label}</td>
                    <td class="py-3 px-4">
                        <span class="bg-slate-700 text-cyan-300 px-2 py-0.5 rounded text-xs font-mono">${cf.type}</span>
                    </td>
                    <td class="py-3 px-4 font-mono text-slate-300">${cf.unit || '-'}</td>
                    <td class="py-3 px-4 text-xs text-slate-400">${cf.options || '-'}</td>
                    <td class="py-3 px-4 text-center">
                        <button onclick="window.deleteCustomField('${cf.key}')" class="text-red-400 hover:text-red-300 p-1 hover:bg-slate-700 rounded transition">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        lucide.createIcons();
    }

    window.deleteCustomField = function (key) {
        if (confirm(`確定要刪除自訂欄位 [${key}]？此欄位將從所有刀具資料中移除。`)) {
            state.customFields = state.customFields.filter(cf => cf.key !== key);
            saveState();
            renderCustomFieldsTable();
            renderMasterToolTable();
            updateBadgesAndCounters();
        }
    };

    // --- MODAL & FORM HANDLERS ---
    function setupModalListeners() {
        // Master Tool Add/Edit Modal
        const toolModal = document.getElementById('toolModal');
        const toolForm = document.getElementById('toolForm');

        document.getElementById('openAddToolModalBtn').addEventListener('click', () => {
            openToolModal();
        });

        document.getElementById('closeToolModalBtn').addEventListener('click', () => {
            toolModal.classList.add('hidden');
        });
        document.getElementById('cancelToolModalBtn').addEventListener('click', () => {
            toolModal.classList.add('hidden');
        });

        toolForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const editId = document.getElementById('toolFormId').value;
            const code = document.getElementById('toolFormCode').value.trim();
            const name = document.getElementById('toolFormName').value.trim();
            const type = document.getElementById('toolFormType').value;
            const d = parseFloat(document.getElementById('toolFormD').value) || 0;
            const l = parseFloat(document.getElementById('toolFormL').value) || 0;
            const z = parseInt(document.getElementById('toolFormZ').value) || 2;
            const material = document.getElementById('toolFormMaterial').value.trim();
            const coating = document.getElementById('toolFormCoating').value.trim();

            const rpm = parseInt(document.getElementById('toolFormRPM').value) || 0;
            const feed = parseInt(document.getElementById('toolFormFeed').value) || 0;
            const fz = parseFloat(document.getElementById('toolFormFz').value) || 0;
            const coolant = document.getElementById('toolFormCoolant').value;

            const stock = parseInt(document.getElementById('toolFormStock').value) || 0;
            const safety = parseInt(document.getElementById('toolFormSafety').value) || 0;
            const status = document.getElementById('toolFormStatus').value;

            // Collect Custom Fields values
            const customData = {};
            state.customFields.forEach(cf => {
                const el = document.getElementById(`cf_input_${cf.key}`);
                if (el) {
                    customData[cf.key] = el.value;
                }
            });

            const toolObj = {
                id: code,
                name,
                type,
                d,
                l,
                z,
                material,
                coating,
                rpm,
                feed,
                fz,
                coolant,
                stock,
                safety,
                status,
                customData
            };

            if (editId) {
                // Edit existing
                const idx = state.masterTools.findIndex(t => t.id === editId);
                if (idx !== -1) {
                    state.masterTools[idx] = toolObj;
                }
            } else {
                // Add new - check duplicate
                if (state.masterTools.some(t => t.id === code)) {
                    alert(`刀具編號 [${code}] 已存在，請使用不同的 Tool ID！`);
                    return;
                }
                state.masterTools.unshift(toolObj);
            }

            saveState();
            renderMasterToolTable();
            updateBadgesAndCounters();
            toolModal.classList.add('hidden');
        });

        // Custom Field Modal
        const cfModal = document.getElementById('customFieldModal');
        const cfForm = document.getElementById('customFieldForm');

        document.getElementById('openAddCustomFieldModalBtn').addEventListener('click', () => {
            cfForm.reset();
            cfModal.classList.remove('hidden');
        });

        document.getElementById('closeCustomFieldModalBtn').addEventListener('click', () => {
            cfModal.classList.add('hidden');
        });
        document.getElementById('cancelCustomFieldModalBtn').addEventListener('click', () => {
            cfModal.classList.add('hidden');
        });

        cfForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const key = document.getElementById('cfKey').value.trim().toLowerCase().replace(/\s+/g, '_');
            const label = document.getElementById('cfLabel').value.trim();
            const type = document.getElementById('cfType').value;
            const unit = document.getElementById('cfUnit').value.trim();
            const options = document.getElementById('cfOptions').value.trim();

            if (state.customFields.some(cf => cf.key === key)) {
                alert(`欄位代碼 [${key}] 已存在！`);
                return;
            }

            state.customFields.push({ key, label, type, unit, options });
            saveState();
            renderCustomFieldsTable();
            renderMasterToolTable();
            updateBadgesAndCounters();
            cfModal.classList.add('hidden');
        });

        // Node Modal (Add Machine / Part)
        const nodeModal = document.getElementById('nodeModal');
        const nodeForm = document.getElementById('nodeForm');

        document.getElementById('closeNodeModalBtn').addEventListener('click', () => nodeModal.classList.add('hidden'));
        document.getElementById('cancelNodeModalBtn').addEventListener('click', () => nodeModal.classList.add('hidden'));

        nodeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const parentId = document.getElementById('nodeFormParentId').value;
            const name = document.getElementById('nodeFormName').value.trim();

            if (!name) return;

            if (!parentId) {
                // Add Machine
                state.hierarchy.push({
                    id: 'mach-' + Date.now(),
                    name: name,
                    type: 'machine',
                    children: []
                });
            } else {
                // Add Part under Machine
                const m = state.hierarchy.find(item => item.id === parentId);
                if (m) {
                    m.children = m.children || [];
                    m.children.push({
                        id: 'part-' + Date.now(),
                        name: name,
                        type: 'part',
                        parentId: parentId,
                        slots: [
                            { slotNo: 'T01', offsetH: 1, offsetD: 1, toolId: '', overhangL: 35, comment: '' }
                        ]
                    });
                }
            }

            saveState();
            renderHierarchyTree();
            updateBadgesAndCounters();
            nodeModal.classList.add('hidden');
            populateMachineStatusSelects();
            populateDiffSelects();
        });

        // Clone Modal
        const cloneModal = document.getElementById('cloneModal');
        document.getElementById('closeCloneModalBtn').addEventListener('click', () => cloneModal.classList.add('hidden'));
        document.getElementById('cancelCloneModalBtn').addEventListener('click', () => cloneModal.classList.add('hidden'));
        document.getElementById('confirmCloneBtn').addEventListener('click', () => {
            const srcPartId = cloneModal.dataset.srcPartId;
            const targetMachineId = document.getElementById('cloneTargetMachine').value;
            const newName = document.getElementById('cloneNewPartName').value.trim();

            if (!targetMachineId || !newName) {
                alert('請選擇目標機台並輸入新工件名稱');
                return;
            }

            const sourceNode = findPartNodeById(srcPartId);
            if (!sourceNode) return;

            const targetMachine = state.hierarchy.find(m => m.id === targetMachineId);
            if (!targetMachine) return;

            const clonedSlots = JSON.parse(JSON.stringify(sourceNode.part.slots || []));
            const newPartId = 'part-' + Date.now();

            targetMachine.children = targetMachine.children || [];
            targetMachine.children.push({
                id: newPartId,
                name: newName,
                type: 'part',
                parentId: targetMachineId,
                slots: clonedSlots
            });

            saveState();
            renderHierarchyTree();
            updateBadgesAndCounters();
            populateMachineStatusSelects();
            populateDiffSelects();
            cloneModal.classList.add('hidden');
            window.selectPartSetup(newPartId);
            alert(`成功複製刀具表至機台「${targetMachine.name}」，新工件: ${newName}`);
        });

        // Part Edit/Move Modal
        const partEditModal = document.getElementById('partEditModal');
        document.getElementById('closePartEditModalBtn').addEventListener('click', () => partEditModal.classList.add('hidden'));
        document.getElementById('cancelPartEditModalBtn').addEventListener('click', () => partEditModal.classList.add('hidden'));
        document.getElementById('confirmPartEditBtn').addEventListener('click', () => {
            const partId = document.getElementById('partEditId').value;
            const newName = document.getElementById('partEditName').value.trim();
            const newMachineId = document.getElementById('partEditMachine').value;

            if (!newName || !newMachineId) {
                alert('請填寫工件名稱並選擇機台');
                return;
            }

            const sourceNode = findPartNodeById(partId);
            if (!sourceNode) return;

            const { machine: oldMachine, part } = sourceNode;

            // Update name
            part.name = newName;

            // Move to different machine if needed
            if (oldMachine.id !== newMachineId) {
                const newMachine = state.hierarchy.find(m => m.id === newMachineId);
                if (!newMachine) return;

                // Remove from old machine
                oldMachine.children = oldMachine.children.filter(p => p.id !== partId);
                // Add to new machine
                part.parentId = newMachineId;
                newMachine.children = newMachine.children || [];
                newMachine.children.push(part);
            }

            saveState();
            renderHierarchyTree();
            updateBadgesAndCounters();
            populateMachineStatusSelects();
            populateDiffSelects();
            partEditModal.classList.add('hidden');
        });

        // Machine Status Tab select
        const machineStatusSel = document.getElementById('machineStatusSelect');
        if (machineStatusSel) {
            machineStatusSel.addEventListener('change', (e) => {
                renderMachineStatusTable(e.target.value);
            });
        }

        // Diff Tab selects
        const diffMachineSel = document.getElementById('diffMachineSelect');
        const diffPartSel = document.getElementById('diffPartSelect');
        if (diffMachineSel) {
            diffMachineSel.addEventListener('change', (e) => {
                populateDiffPartSelect(e.target.value);
            });
        }
        const runDiffBtn = document.getElementById('runDiffBtn');
        if (runDiffBtn) {
            runDiffBtn.addEventListener('click', runDiffComparison);
        }
    }

    function openToolModal(toolIdToEdit = null) {
        const modal = document.getElementById('toolModal');
        const title = document.getElementById('toolModalTitle');
        const form = document.getElementById('toolForm');
        form.reset();

        // Render Dynamic Custom Inputs
        renderDynamicFormInputs(toolIdToEdit);

        if (toolIdToEdit) {
            const tool = state.masterTools.find(t => t.id === toolIdToEdit);
            if (tool) {
                title.querySelector('span').textContent = '編輯刀具 (Edit Tool)';
                document.getElementById('toolFormId').value = tool.id;
                document.getElementById('toolFormCode').value = tool.id;
                document.getElementById('toolFormCode').readOnly = true;
                document.getElementById('toolFormName').value = tool.name;
                document.getElementById('toolFormType').value = tool.type;
                document.getElementById('toolFormD').value = tool.d;
                document.getElementById('toolFormL').value = tool.l || '';
                document.getElementById('toolFormZ').value = tool.z || 4;
                document.getElementById('toolFormMaterial').value = tool.material || '';
                document.getElementById('toolFormCoating').value = tool.coating || '';

                document.getElementById('toolFormRPM').value = tool.rpm || '';
                document.getElementById('toolFormFeed').value = tool.feed || '';
                document.getElementById('toolFormFz').value = tool.fz || '';
                document.getElementById('toolFormCoolant').value = tool.coolant || '水溶性切削液';

                document.getElementById('toolFormStock').value = tool.stock;
                document.getElementById('toolFormSafety').value = tool.safety;
                document.getElementById('toolFormStatus').value = tool.status;

                // Fill custom field inputs
                if (tool.customData) {
                    state.customFields.forEach(cf => {
                        const el = document.getElementById(`cf_input_${cf.key}`);
                        if (el && tool.customData[cf.key] !== undefined) {
                            el.value = tool.customData[cf.key];
                        }
                    });
                }
            }
        } else {
            title.querySelector('span').textContent = '新增刀具 (Add Master Tool)';
            document.getElementById('toolFormId').value = '';
            document.getElementById('toolFormCode').readOnly = false;
        }

        modal.classList.remove('hidden');
    }

    function renderDynamicFormInputs(editId) {
        const container = document.getElementById('dynamicCustomFieldsContainer');
        const inputsWrapper = document.getElementById('dynamicFieldsInputs');

        if (state.customFields.length === 0) {
            container.classList.add('hidden');
            return;
        }

        container.classList.remove('hidden');

        inputsWrapper.innerHTML = state.customFields.map(cf => {
            let inputHtml = '';
            if (cf.type === 'select') {
                const opts = (cf.options || '').split(',').map(o => o.trim());
                inputHtml = `
                    <select id="cf_input_${cf.key}" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100">
                        ${opts.map(o => `<option value="${o}">${o}</option>`).join('')}
                    </select>
                `;
            } else if (cf.type === 'number') {
                inputHtml = `<input type="number" step="any" id="cf_input_${cf.key}" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100">`;
            } else if (cf.type === 'date') {
                inputHtml = `<input type="date" id="cf_input_${cf.key}" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100">`;
            } else {
                inputHtml = `<input type="text" id="cf_input_${cf.key}" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100">`;
            }

            return `
                <div>
                    <label class="block text-xs text-slate-400 mb-1">${cf.label} ${cf.unit ? '(' + cf.unit + ')' : ''}</label>
                    ${inputHtml}
                </div>
            `;
        }).join('');
    }

    window.editTool = function (toolId) {
        openToolModal(toolId);
    };

    window.deleteTool = function (toolId) {
        if (confirm(`確定要刪除刀具 [${toolId}]？`)) {
            state.masterTools = state.masterTools.filter(t => t.id !== toolId);
            saveState();
            renderMasterToolTable();
            renderPartSetupTab();
            updateBadgesAndCounters();
        }
    };

    window.openNodeModal = function (type, parentId = '') {
        const modal = document.getElementById('nodeModal');
        const title = document.getElementById('nodeModalTitle');
        const label = document.getElementById('nodeFormLabel');
        const input = document.getElementById('nodeFormName');
        document.getElementById('nodeFormParentId').value = parentId;
        input.value = '';

        if (type === 'machine') {
            title.textContent = '新增 CNC 機台';
            label.textContent = '機台名稱/編號 (例: VMC-850A, 5-Axis-01)';
        } else {
            title.textContent = '新增工件 / 加工工序 (Part/OP)';
            label.textContent = '工件圖號與工序名稱 (例: Part-A101_OP10)';
        }

        modal.classList.remove('hidden');
    };

    // --- SPEED & FEED CALCULATOR ---
    function setupCalculatorListeners() {
        const modal = document.getElementById('calcModal');
        const openBtn = document.getElementById('calcModalOpenBtn');
        const closeBtn = document.getElementById('closeCalcModalBtn');

        openBtn.addEventListener('click', () => modal.classList.remove('hidden'));
        closeBtn.addEventListener('click', () => modal.classList.add('hidden'));

        const inputs = ['calcD', 'calcZ', 'calcVc', 'calcFz'];
        inputs.forEach(id => {
            document.getElementById(id).addEventListener('input', calculateSpeedAndFeed);
        });
    }

    function calculateSpeedAndFeed() {
        const d = parseFloat(document.getElementById('calcD').value) || 1;
        const z = parseFloat(document.getElementById('calcZ').value) || 1;
        const vc = parseFloat(document.getElementById('calcVc').value) || 0;
        const fz = parseFloat(document.getElementById('calcFz').value) || 0;

        // RPM = (1000 * Vc) / (pi * D)
        const rpm = Math.round((1000 * vc) / (Math.PI * d));
        // Feed = RPM * Z * fz
        const feed = Math.round(rpm * z * fz);

        document.getElementById('resRPM').textContent = isFinite(rpm) ? rpm : 0;
        document.getElementById('resFeed').textContent = isFinite(feed) ? feed : 0;
    }

    // --- IMPORT / EXPORT OPERATIONS ---
    // CSV / EXCEL IMPORT
    document.getElementById('importFileInput').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (evt) {
            try {
                const data = new Uint8Array(evt.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);

                if (json.length === 0) {
                    alert('匯入的檔案無資料！');
                    return;
                }

                let importedCount = 0;
                json.forEach(row => {
                    const id = row['刀具編號'] || row['Tool ID'] || row['id'];
                    const name = row['刀具名稱'] || row['Name'] || row['name'];
                    if (id && name) {
                        const existingIdx = state.masterTools.findIndex(t => t.id === id);
                        const toolObj = {
                            id: String(id),
                            name: String(name),
                            type: row['刀具類型'] || row['Type'] || '立銑刀',
                            d: parseFloat(row['刀徑 D']) || parseFloat(row['D']) || 10,
                            l: parseFloat(row['刀長 L']) || parseFloat(row['L']) || 75,
                            z: parseInt(row['刃數 Z']) || parseInt(row['Z']) || 4,
                            material: row['材質'] || row['Material'] || 'Carbide',
                            coating: row['鍍膜'] || row['Coating'] || 'AlCrN',
                            rpm: parseInt(row['主軸轉速 RPM']) || parseInt(row['RPM']) || 4000,
                            feed: parseInt(row['進給速度 F']) || parseInt(row['Feed']) || 1000,
                            fz: parseFloat(row['每刃進給 fz']) || parseFloat(row['fz']) || 0.05,
                            coolant: row['冷卻方式'] || '水溶性切削液',
                            stock: parseInt(row['現有庫存']) || 10,
                            safety: parseInt(row['安全庫存']) || 2,
                            status: row['狀態'] || '在庫',
                            customData: {}
                        };

                        if (existingIdx !== -1) {
                            state.masterTools[existingIdx] = toolObj;
                        } else {
                            state.masterTools.push(toolObj);
                        }
                        importedCount++;
                    }
                });

                saveState();
                renderMasterToolTable();
                updateBadgesAndCounters();
                alert(`成功匯入/更新 ${importedCount} 筆刀具資料！`);
            } catch (err) {
                alert('匯入解析失敗: ' + err.message);
            }
        };
        reader.readAsArrayBuffer(file);
    });

    // EXCEL EXPORT
    function exportToExcel() {
        const dataToExport = state.masterTools.map(t => {
            const row = {
                '刀具編號 (Tool ID)': t.id,
                '刀具名稱': t.name,
                '刀具類型': t.type,
                '外徑 D (mm)': t.d,
                '全長 L (mm)': t.l,
                '刃數 Z': t.z,
                '材質': t.material,
                '鍍膜': t.coating,
                '建議轉速 RPM': t.rpm,
                '進給 F (mm/min)': t.feed,
                '每刃進給 fz': t.fz,
                '冷卻方式': t.coolant,
                '現有庫存': t.stock,
                '安全庫存': t.safety,
                '狀態': t.status
            };

            // Custom fields
            state.customFields.forEach(cf => {
                row[cf.label] = (t.customData && t.customData[cf.key] !== undefined) ? t.customData[cf.key] : '';
            });

            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Master Tools');

        XLSX.writeFile(workbook, `CNC_Tool_Master_Library_${new Date().toISOString().split('T')[0]}.xlsx`);
    }

    // PDF EXPORT FOR SHOP FLOOR PRESETTER SHEET
    function exportToPdf() {
        if (state.activeTab !== 'tab-presetter') {
            switchTab('tab-presetter');
        }

        setTimeout(() => {
            const element = document.getElementById('printableArea');
            const opt = {
                margin: 0.3,
                filename: `CNC_Tool_Presetter_Sheet_${new Date().toISOString().split('T')[0]}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
            };

            html2pdf().set(opt).from(element).save();
        }, 300);
    }

})();
