import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { HeartIcon, GavelIcon, UsersIcon, Share2Icon } from './icons';

type NodeId = 'center' | 'ethics' | 'law' | 'culture';

interface MindMapNode {
    id: NodeId;
    cx: number;
    cy: number;
    r: number;
    color: string; // Tailwind fill class
    gradientStopColor: string; // Hex color for gradient
    labelKey: string;
    descKey: string;
    Icon: React.FC<{ className?: string }>;
}

const nodesData: MindMapNode[] = [
    { id: 'center', cx: 300, cy: 200, r: 60, color: 'fill-[#0B72B9]', gradientStopColor: '#0B72B9', labelKey: 'mindmap_center_node', descKey: 'mindmap_center_desc', Icon: Share2Icon },
    { id: 'ethics', cx: 100, cy: 100, r: 45, color: 'fill-blue-500', gradientStopColor: '#3b82f6', labelKey: 'mindmap_ethics_node', descKey: 'mindmap_ethics_desc', Icon: HeartIcon },
    { id: 'law', cx: 500, cy: 100, r: 45, color: 'fill-red-500', gradientStopColor: '#ef4444', labelKey: 'mindmap_law_node', descKey: 'mindmap_law_desc', Icon: GavelIcon },
    { id: 'culture', cx: 300, cy: 350, r: 45, color: 'fill-green-500', gradientStopColor: '#22c55e', labelKey: 'mindmap_culture_node', descKey: 'mindmap_culture_desc', Icon: UsersIcon },
];

const linesData: { from: NodeId; to: NodeId }[] = [
    { from: 'center', to: 'ethics' },
    { from: 'center', to: 'law' },
    { from: 'center', to: 'culture' },
];

const MindMap: React.FC = () => {
    const { t } = useLanguage();
    const [activeNodeId, setActiveNodeId] = useState<NodeId>('center');
    const [hoveredNodeId, setHoveredNodeId] = useState<NodeId | null>(null);

    const activeNode = nodesData.find(n => n.id === activeNodeId) || nodesData[0];
    const centerNode = nodesData.find(n => n.id === 'center')!;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col lg:flex-row items-center gap-8">
            <div className="w-full lg:w-2/3">
                <svg viewBox="0 0 600 450" className="w-full h-auto" aria-labelledby="mindmap-title">
                    <title id="mindmap-title">{t('knowledge_mindmap_title')}</title>
                    <defs>
                        <filter id="drop-shadow" x="-50%" y="-50%" width="200%" height="200%">
                            <feDropShadow dx="2" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.2"/>
                        </filter>
                        {linesData.map(({ to }) => {
                            const fromNode = centerNode;
                            const toNode = nodesData.find(n => n.id === to)!;
                            return (
                                <linearGradient key={`grad-${to}`} id={`grad-${to}`} x1={fromNode.cx} y1={fromNode.cy} x2={toNode.cx} y2={toNode.cy} gradientUnits="userSpaceOnUse">
                                    <stop offset="0%" stopColor={fromNode.gradientStopColor} />
                                    <stop offset="100%" stopColor={toNode.gradientStopColor} />
                                </linearGradient>
                            );
                        })}
                    </defs>

                    {linesData.map(({ to }, i) => {
                        const fromNode = centerNode;
                        const toNode = nodesData.find(n => n.id === to)!;
                        const isHovered = hoveredNodeId === to || hoveredNodeId === fromNode.id;
                        return (
                          <line
                              key={i}
                              x1={fromNode.cx} y1={fromNode.cy}
                              x2={toNode.cx} y2={toNode.cy}
                              stroke={`url(#grad-${to})`}
                              strokeWidth={isHovered ? 6 : 4}
                              className="mindmap-line transition-all duration-300"
                              style={{ animationDelay: `${i * 0.2}s`, opacity: (hoveredNodeId && !isHovered) ? 0.3 : 1 }}
                          />
                        );
                    })}

                    {nodesData.map((node, i) => {
                        const { Icon } = node;
                        const isHovered = hoveredNodeId === node.id;
                        const isActive = activeNodeId === node.id;
                        const iconSizeRatio = node.id === 'center' ? 0.5 : 0.45;
                        const textYOffset = node.id === 'center' ? 18 : 12;

                        return (
                            <g
                                key={node.id}
                                onClick={() => setActiveNodeId(node.id)}
                                onMouseEnter={() => setHoveredNodeId(node.id)}
                                onMouseLeave={() => setHoveredNodeId(null)}
                                className="cursor-pointer mindmap-node"
                                style={{ animationDelay: `${0.5 + i * 0.15}s`, transform: `translate(${node.cx}px, ${node.cy}px)` }}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveNodeId(node.id); }}
                            >
                                <circle
                                    r={node.r}
                                    className={`${node.color} transition-all duration-300`}
                                    stroke={isActive ? '#f59e0b' : 'white'}
                                    strokeWidth={isActive ? 5 : 3}
                                    filter="url(#drop-shadow)"
                                    style={{ 
                                        transform: isHovered ? 'scale(1.1)' : 'scale(1)', 
                                        transition: 'transform 0.2s ease-out',
                                        filter: isActive ? 'url(#drop-shadow) drop-shadow(0 0 8px #f59e0b)' : 'url(#drop-shadow)',
                                     }}
                                />
                                <foreignObject x={-node.r} y={-node.r} width={node.r * 2} height={node.r * 2} style={{pointerEvents: 'none'}}>
                                    <div 
                                        className="w-full h-full flex flex-col items-center justify-center text-white font-bold text-center select-none"
                                        style={{ transform: isHovered ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.2s ease-out' }}
                                    >
                                        <Icon style={{width: `${node.r * iconSizeRatio * 2}px`, height: `${node.r * iconSizeRatio * 2}px`}} />
                                        <span className="mt-1 px-1" style={{ fontSize: '11px', transform: `translateY(${textYOffset}px)` }}>{t(node.labelKey)}</span>
                                    </div>
                                </foreignObject>
                            </g>
                        );
                    })}
                </svg>
            </div>
            <div className="w-full lg:w-1/3 p-4 bg-gray-50 rounded-lg min-h-[150px]">
                <div key={activeNode.id} className="screen-transition">
                    <h4 className="font-bold text-xl text-gray-800 mb-2">{t(activeNode.labelKey)}</h4>
                    <p className="text-gray-600">{t(activeNode.descKey)}</p>
                </div>
            </div>
        </div>
    );
};

export default MindMap;
