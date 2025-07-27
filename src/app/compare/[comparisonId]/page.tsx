"use client";

import {
    Compare as CompareIcon,
    Download as DownloadIcon,
    History as HistoryIcon,
    Login as LoginIcon,
    Logout as LogoutIcon,
    Person as PersonIcon,
    SwapHoriz as SwapIcon,
    ViewColumn as ViewColumnIcon,
    ViewStream as ViewStreamIcon
} from "@mui/icons-material";
import {
    Alert,
    AppBar,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Divider,
    IconButton,
    Menu,
    MenuItem,
    Paper,
    Snackbar,
    ToggleButton,
    ToggleButtonGroup,
    Toolbar,
    Typography,
    useTheme
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "../../../services/api";
import { DiffChange, DiffResult } from "../../../types/api";
import { useComparePageContext } from "../compare-page-provider";

interface DocumentData {
    title: string;
    content: string;
}

interface DiffLine {
    type: 'added' | 'removed' | 'unchanged' | 'modified';
    content: string;
    lineNumber?: number;
}

interface SideBySideLineData {
    leftLine: {
        content: string;
        lineNumber: number;
        hasChange: boolean;
    } | null;
    rightLine: {
        content: string;
        lineNumber: number;
        hasChange: boolean;
    } | null;
}

type ViewMode = 'side-by-side' | 'unified';

export default function ComparisonResultPage({
    params
}: {
    params: { comparisonId: string }
}) {
    const theme = useTheme();
    const router = useRouter();
    const { authData, logout } = useComparePageContext();
    const comparisonId = parseInt(params.comparisonId);
    
    const [leftDoc, setLeftDoc] = useState<DocumentData>({
        title: "",
        content: ""
    });
    const [rightDoc, setRightDoc] = useState<DocumentData>({
        title: "",
        content: ""
    });
    const [diffResult, setDiffResult] = useState<DiffLine[]>([]);
    const [sideBySideData, setSideBySideData] = useState<SideBySideLineData[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>('side-by-side');
    const [isLoadingComparison, setIsLoadingComparison] = useState(false);
    const [loadedComparison, setLoadedComparison] = useState<DiffResult | null>(null);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning'>('success');

    // 사용자 메뉴 상태
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const isAuthenticated = authData.authenticated;
    const userIdentity = authData.userIdentity;

    // 저장된 비교 결과 로드
    useEffect(() => {
        console.log('useEffect triggered:', { comparisonId, isAuthenticated });
        if (comparisonId) {
            loadComparisonResult(comparisonId);
        }
    }, [comparisonId]);

    const loadComparisonResult = async (id: number) => {
        console.log('=== loadComparisonResult 시작 ===');
        console.log('요청 ID:', id);
        console.log('현재 인증 상태:', isAuthenticated);
        console.log('사용자 정보:', userIdentity);
        
        setIsLoadingComparison(true);
        setSnackbarMessage('');
        
        try {
            // API 호출 전 로그
            console.log('API 호출 시작: getDiffResult(' + id + ')');
            
            const result = await api.compare.getDiffResult(id);
            
            console.log('=== API 응답 성공 ===');
            console.log('응답 데이터:', JSON.stringify(result, null, 2));
            
            if (!result) {
                throw new Error('API 응답이 비어있습니다.');
            }
            
            setLoadedComparison(result);
            
            // 원본 텍스트가 있으면 문서 데이터 설정
            if (result.originalText && result.compareText) {
                console.log('원본 텍스트 사용');
                console.log('원본 텍스트 길이:', result.originalText.length);
                console.log('비교 텍스트 길이:', result.compareText.length);
                
                setLeftDoc({
                    title: result.diffTitle + ' (원본)',
                    content: result.originalText
                });
                setRightDoc({
                    title: result.diffTitle + ' (비교)',
                    content: result.compareText
                });
            } else if (result.originalDocumentId && result.compareDocumentId) {
                // 문서 ID가 있으면 문서 조회
                console.log('문서 ID 사용');
                console.log('원본 문서 ID:', result.originalDocumentId);
                console.log('비교 문서 ID:', result.compareDocumentId);
                
                try {
                    const [originalDoc, compareDoc] = await Promise.all([
                        api.documents.getDocument(result.originalDocumentId),
                        api.documents.getDocument(result.compareDocumentId)
                    ]);
                    
                    console.log('문서 조회 성공:');
                    console.log('원본 문서:', originalDoc);
                    console.log('비교 문서:', compareDoc);
                    
                    setLeftDoc({
                        title: originalDoc.title,
                        content: originalDoc.content
                    });
                    setRightDoc({
                        title: compareDoc.title,
                        content: compareDoc.content
                    });
                } catch (docError) {
                    console.error('문서 조회 실패:', docError);
                    setSnackbarMessage('연관된 문서를 불러오는데 실패했습니다.');
                    setSnackbarSeverity('error');
                    return;
                }
            } else {
                console.warn('텍스트도 문서 ID도 없음');
                setSnackbarMessage('비교할 데이터가 없습니다.');
                setSnackbarSeverity('warning');
                return;
            }
            
            // 저장된 비교 결과를 UI에 맞게 변환
            console.log('UI 변환 시작');
            convertDiffResultToUI(result);
            
            setSnackbarMessage('저장된 비교 결과를 불러왔습니다.');
            setSnackbarSeverity('success');
            
            console.log('=== loadComparisonResult 완료 ===');
            
        } catch (error: any) {
            console.error('=== 비교 결과 로드 실패 ===');
            console.error('에러 객체:', error);
            console.error('에러 메시지:', error.message);
            console.error('에러 상태:', error.status);
            console.error('에러 상세:', error.details);
            
            let errorMessage = '비교 결과를 불러오는데 실패했습니다.';
            
            if (error.status === 401) {
                errorMessage = '인증이 필요합니다. 로그인 후 다시 시도해주세요.';
            } else if (error.status === 403) {
                errorMessage = '접근 권한이 없습니다.';
            } else if (error.status === 404) {
                errorMessage = '요청한 비교 결과를 찾을 수 없습니다.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setSnackbarMessage(errorMessage);
            setSnackbarSeverity('error');
            
            // 네트워크 정보도 출력
            if (typeof window !== 'undefined') {
                console.log('현재 URL:', window.location.href);
                console.log('localStorage 토큰:', localStorage.getItem('auth_token'));
                console.log('sessionStorage 토큰:', sessionStorage.getItem('auth_token'));
            }
        } finally {
            setIsLoadingComparison(false);
        }
    };

    // DiffResult를 UI에 맞게 변환
    const convertDiffResultToUI = (result: DiffResult) => {
        console.log('convertDiffResultToUI called with:', result);
        
        // 빈 데이터 처리
        if (!result.diffData || !result.diffData.changes || result.diffData.changes.length === 0) {
            console.log('No changes found in diffData');
            // 원본 텍스트와 비교 텍스트가 있다면 직접 비교
            if (result.originalText && result.compareText) {
                console.log('Using original text for comparison');
                const leftLines = result.originalText.split('\n');
                const rightLines = result.compareText.split('\n');
                const unifiedResult: DiffLine[] = [];
                const sideByResult: SideBySideLineData[] = [];

                const maxLines = Math.max(leftLines.length, rightLines.length);
                
                for (let i = 0; i < maxLines; i++) {
                    const leftLine = leftLines[i] || '';
                    const rightLine = rightLines[i] || '';
                    
                    if (leftLine === rightLine) {
                        unifiedResult.push({
                            type: 'unchanged',
                            content: leftLine,
                            lineNumber: i + 1
                        });
                        
                        sideByResult.push({
                            leftLine: {
                                content: leftLine,
                                lineNumber: i + 1,
                                hasChange: false
                            },
                            rightLine: {
                                content: rightLine,
                                lineNumber: i + 1,
                                hasChange: false
                            }
                        });
                    } else {
                        if (leftLine) {
                            unifiedResult.push({
                                type: 'removed',
                                content: leftLine,
                                lineNumber: i + 1
                            });
                        }
                        if (rightLine) {
                            unifiedResult.push({
                                type: 'added',
                                content: rightLine,
                                lineNumber: i + 1
                            });
                        }
                        
                        sideByResult.push({
                            leftLine: leftLines[i] !== undefined ? {
                                content: leftLine,
                                lineNumber: i + 1,
                                hasChange: true
                            } : null,
                            rightLine: rightLines[i] !== undefined ? {
                                content: rightLine,
                                lineNumber: i + 1,
                                hasChange: true
                            } : null
                        });
                    }
                }
                
                setDiffResult(unifiedResult);
                setSideBySideData(sideByResult);
                console.log('Generated diff from original text:', { unifiedResult, sideByResult });
                return;
            }
            
            // 완전히 빈 데이터인 경우
            setDiffResult([]);
            setSideBySideData([]);
            return;
        }

        const changes = result.diffData.changes;
        const unifiedResult: DiffLine[] = [];
        const sideByResult: SideBySideLineData[] = [];

        // 변경 사항을 라인별로 그룹화
        const lineMap = new Map<number, DiffChange[]>();
        changes.forEach(change => {
            if (!lineMap.has(change.lineNumber)) {
                lineMap.set(change.lineNumber, []);
            }
            lineMap.get(change.lineNumber)!.push(change);
        });

        // 라인별로 처리
        const sortedLines = Array.from(lineMap.keys()).sort((a, b) => a - b);
        
        sortedLines.forEach(lineNumber => {
            const lineChanges = lineMap.get(lineNumber)!;
            
            lineChanges.forEach(change => {
                // 통합 뷰용 데이터
                unifiedResult.push({
                    type: change.type,
                    content: change.content,
                    lineNumber: change.lineNumber
                });
                
                // 사이드 바이 사이드용 데이터
                if (change.type === 'added') {
                    sideByResult.push({
                        leftLine: null,
                        rightLine: {
                            content: change.content,
                            lineNumber: change.compareLine || change.lineNumber,
                            hasChange: true
                        }
                    });
                } else if (change.type === 'removed') {
                    sideByResult.push({
                        leftLine: {
                            content: change.content,
                            lineNumber: change.originalLine || change.lineNumber,
                            hasChange: true
                        },
                        rightLine: null
                    });
                } else {
                    sideByResult.push({
                        leftLine: {
                            content: change.content,
                            lineNumber: change.originalLine || change.lineNumber,
                            hasChange: false
                        },
                        rightLine: {
                            content: change.content,
                            lineNumber: change.compareLine || change.lineNumber,
                            hasChange: false
                        }
                    });
                }
            });
        });

        setDiffResult(unifiedResult);
        setSideBySideData(sideByResult);
        console.log('Generated diff from changes:', { unifiedResult, sideByResult });
    };

    // 사용자 메뉴 열기
    const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    // 사용자 메뉴 닫기
    const handleUserMenuClose = () => {
        setAnchorEl(null);
    };

    // 로그아웃
    const handleLogout = async () => {
        try {
            await logout?.();
        } catch (error) {
            console.error('로그아웃 실패:', error);
        }
        handleUserMenuClose();
    };

    // 문서 교환
    const swapDocuments = () => {
        const temp = { ...leftDoc };
        setLeftDoc(rightDoc);
        setRightDoc(temp);
        
        // 비교 결과도 다시 생성
        if (loadedComparison) {
            generateDiffFromContent(rightDoc.content, leftDoc.content);
        }
    };

    // 클립보드 복사
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setSnackbarMessage('클립보드에 복사되었습니다!');
        setSnackbarSeverity('success');
    };

    // 차이점 다운로드
    const downloadDiff = () => {
        const diffText = diffResult.map(line => {
            const prefix = line.type === 'added' ? '+ ' : 
                         line.type === 'removed' ? '- ' : '  ';
            return `${prefix}${line.content}`;
        }).join('\n');
        
        const blob = new Blob([diffText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `diff-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // 내용을 기반으로 diff 생성
    const generateDiffFromContent = (leftContent: string, rightContent: string) => {
        const leftLines = leftContent.split('\n');
        const rightLines = rightContent.split('\n');
        
        const unifiedResult: DiffLine[] = [];
        const sideByResult: SideBySideLineData[] = [];

        const maxLines = Math.max(leftLines.length, rightLines.length);
        
        for (let i = 0; i < maxLines; i++) {
            const leftLine = leftLines[i] || '';
            const rightLine = rightLines[i] || '';
            
            if (leftLine === rightLine) {
                if (leftLine.trim() !== '' || rightLine.trim() !== '') {
                    unifiedResult.push({
                        type: 'unchanged',
                        content: leftLine,
                        lineNumber: i + 1
                    });
                    
                    sideByResult.push({
                        leftLine: {
                            content: leftLine,
                            lineNumber: i + 1,
                            hasChange: false
                        },
                        rightLine: {
                            content: rightLine,
                            lineNumber: i + 1,
                            hasChange: false
                        }
                    });
                }
            } else {
                if (leftLine !== undefined && leftLine.trim() !== '') {
                    unifiedResult.push({
                        type: 'removed',
                        content: leftLine,
                        lineNumber: i + 1
                    });
                }
                if (rightLine !== undefined && rightLine.trim() !== '') {
                    unifiedResult.push({
                        type: 'added',
                        content: rightLine,
                        lineNumber: i + 1
                    });
                }
                
                sideByResult.push({
                    leftLine: leftLines[i] !== undefined ? {
                        content: leftLine,
                        lineNumber: i + 1,
                        hasChange: true
                    } : null,
                    rightLine: rightLines[i] !== undefined ? {
                        content: rightLine,
                        lineNumber: i + 1,
                        hasChange: true
                    } : null
                });
            }
        }
        
        setDiffResult(unifiedResult);
        setSideBySideData(sideByResult);
    };

    // 라인 스타일 가져오기
    const getDiffLineStyle = (type: string) => {
        switch (type) {
            case 'added':
                return {
                    backgroundColor: theme.palette.success.main + '20',
                    borderLeft: `4px solid ${theme.palette.success.main}`,
                    paddingLeft: '8px'
                };
            case 'removed':
                return {
                    backgroundColor: theme.palette.error.main + '20',
                    borderLeft: `4px solid ${theme.palette.error.main}`,
                    paddingLeft: '8px'
                };
            case 'unchanged':
                return {
                    backgroundColor: 'transparent',
                    paddingLeft: '12px'
                };
            default:
                return {};
        }
    };

    // 차이점 통계 (저장된 결과가 있으면 그것을 사용)
    const getStats = () => {
        if (loadedComparison) {
            const stats = loadedComparison.diffData.statistics;
            return {
                added: stats.addedLines,
                removed: stats.removedLines,
                unchanged: stats.totalLines - stats.addedLines - stats.removedLines - stats.modifiedLines,
                total: stats.totalLines
            };
        }
        
        const added = diffResult.filter(line => line.type === 'added').length;
        const removed = diffResult.filter(line => line.type === 'removed').length;
        const unchanged = diffResult.filter(line => line.type === 'unchanged').length;
        
        return {
            added,
            removed,
            unchanged,
            total: added + removed + unchanged
        };
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* 헤더 */}
            <AppBar position="static" color="default" elevation={1}>
                <Toolbar>
                    <CompareIcon sx={{ mr: 2 }} />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        문서 비교 도구
                        {loadedComparison && (
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                ({loadedComparison.diffTitle})
                            </Typography>
                        )}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {/* 로그인 상태에 따른 조건부 렌더링 */}
                        {isAuthenticated ? (
                            <>
                                {/* 로그인된 사용자 메뉴 */}
                                <Button
                                    component={Link}
                                    href="/comparisons"
                                    color="inherit"
                                    startIcon={<HistoryIcon />}
                                    sx={{ mr: 1 }}
                                >
                                    저장된 비교 결과
                                </Button>
                                <Button
                                    component={Link}
                                    href="/documents"
                                    color="inherit"
                                    sx={{ mr: 1 }}
                                >
                                    문서 관리
                                </Button>
                                <Button
                                    component={Link}
                                    href="/compare"
                                    color="inherit"
                                    sx={{ mr: 1 }}
                                >
                                    새 비교
                                </Button>
                                <IconButton
                                    color="inherit"
                                    onClick={handleUserMenuOpen}
                                    sx={{ ml: 1 }}
                                >
                                    <Avatar sx={{ width: 32, height: 32 }}>
                                        {userIdentity?.username?.charAt(0)?.toUpperCase() || 
                                         userIdentity?.email?.charAt(0)?.toUpperCase() || 
                                         <PersonIcon />}
                                    </Avatar>
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleUserMenuClose}
                                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                >
                                    <MenuItem disabled>
                                        <Typography variant="body2">
                                            {userIdentity?.username || userIdentity?.email || '사용자'}
                                        </Typography>
                                    </MenuItem>
                                    <Divider />
                                    <MenuItem onClick={handleLogout}>
                                        <LogoutIcon sx={{ mr: 1 }} />
                                        로그아웃
                                    </MenuItem>
                                </Menu>
                            </>
                        ) : (
                            <>
                                {/* 비로그인 사용자 메뉴 */}
                                <Button
                                    component={Link}
                                    href="/login"
                                    color="inherit"
                                    startIcon={<LoginIcon />}
                                    sx={{ mr: 1 }}
                                >
                                    로그인
                                </Button>
                                <Button
                                    component={Link}
                                    href="/compare"
                                    color="inherit"
                                    sx={{ mr: 1 }}
                                >
                                    새 비교
                                </Button>
                                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                                    로그인하면 비교 결과를 저장할 수 있습니다
                                </Typography>
                            </>
                        )}
                        
                        <IconButton 
                            color="inherit" 
                            onClick={swapDocuments}
                            title="문서 교환"
                        >
                            <SwapIcon />
                        </IconButton>
                        
                        {diffResult.length > 0 && (
                            <IconButton 
                                color="inherit" 
                                onClick={downloadDiff}
                                title="차이점 다운로드"
                            >
                                <DownloadIcon />
                            </IconButton>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>

            <Container maxWidth="xl" sx={{ py: 3 }}>
                {isLoadingComparison ? (
                    /* 로딩 상태 */
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h6" color="text.secondary">
                            비교 결과를 불러오는 중...
                        </Typography>
                    </Box>
                ) : (
                    /* 비교 결과 표시 */
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                            <Typography variant="h5">
                                {loadedComparison ? loadedComparison.diffTitle : '비교 결과'}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                {/* 뷰 모드 토글 */}
                                <ToggleButtonGroup
                                    value={viewMode}
                                    exclusive
                                    onChange={(e, newMode) => newMode && setViewMode(newMode)}
                                    size="small"
                                >
                                    <ToggleButton value="side-by-side" aria-label="사이드 바이 사이드">
                                        <ViewColumnIcon sx={{ mr: 1 }} />
                                        사이드 바이 사이드
                                    </ToggleButton>
                                    <ToggleButton value="unified" aria-label="통합 뷰">
                                        <ViewStreamIcon sx={{ mr: 1 }} />
                                        통합 뷰
                                    </ToggleButton>
                                </ToggleButtonGroup>
                                
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={() => router.push(`/compare/documents/${comparisonId}`)}
                                >
                                    결과 전용 보기
                                </Button>
                            </Box>
                        </Box>

                        {/* 제목 비교 */}
                        {(leftDoc.title || rightDoc.title) && (
                            <Card sx={{ mb: 3 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>문서 제목</Typography>
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="subtitle2" color="error">원본</Typography>
                                            <Typography variant="body2">{leftDoc.title || '(제목 없음)'}</Typography>
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="subtitle2" color="success.main">비교</Typography>
                                            <Typography variant="body2">{rightDoc.title || '(제목 없음)'}</Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        )}

                        {/* 통계 정보 */}
                        <Card sx={{ mb: 3 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>변경 사항 통계</Typography>
                                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                    <Chip 
                                        label={`추가: ${getStats().added}줄`} 
                                        color="success" 
                                        variant="outlined"
                                    />
                                    <Chip 
                                        label={`삭제: ${getStats().removed}줄`} 
                                        color="error" 
                                        variant="outlined"
                                    />
                                    <Chip 
                                        label={`변경 없음: ${getStats().unchanged}줄`} 
                                        color="default" 
                                        variant="outlined"
                                    />
                                    <Chip 
                                        label={`전체: ${getStats().total}줄`} 
                                        color="primary" 
                                        variant="outlined"
                                    />
                                    {loadedComparison && (
                                        <Chip 
                                            label={`유사도: ${(loadedComparison.diffData.statistics.similarity * 100).toFixed(1)}%`} 
                                            color="info" 
                                            variant="outlined"
                                        />
                                    )}
                                </Box>
                            </CardContent>
                        </Card>

                        {/* 요약 정보 (저장된 결과가 있을 때만) */}
                        {loadedComparison && loadedComparison.diffData.summary && (
                            <Card sx={{ mb: 3 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>비교 요약</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {loadedComparison.diffData.summary}
                                    </Typography>
                                </CardContent>
                            </Card>
                        )}

                        {/* 비교 결과 */}
                        <Card>
                            <CardContent>
                                {viewMode === 'unified' ? (
                                    /* 통합 뷰 */
                                    <Box sx={{ fontFamily: 'monospace', fontSize: '14px', lineHeight: '1.5' }}>
                                        {diffResult.map((line, index) => (
                                            <Box
                                                key={index}
                                                sx={{
                                                    ...getDiffLineStyle(line.type),
                                                    py: 0.5,
                                                    minHeight: '22px',
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    whiteSpace: 'pre-wrap',
                                                    wordBreak: 'break-word'
                                                }}
                                            >
                                                <Typography 
                                                    variant="body2" 
                                                    component="span"
                                                    sx={{ 
                                                        fontFamily: 'monospace',
                                                        fontSize: '14px',
                                                        lineHeight: '1.5',
                                                        color: line.type === 'added' ? 'success.main' : 
                                                              line.type === 'removed' ? 'error.main' : 'text.primary'
                                                    }}
                                                >
                                                    {line.type === 'added' ? '+ ' : 
                                                     line.type === 'removed' ? '- ' : '  '}
                                                    {line.content}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                ) : (
                                    /* 사이드 바이 사이드 뷰 */
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        {/* 원본 문서 (왼쪽) */}
                                        <Paper sx={{ flex: 1, bgcolor: 'grey.50' }}>
                                            <Box sx={{ p: 2, bgcolor: 'grey.200', borderBottom: 1, borderColor: 'divider' }}>
                                                <Typography variant="subtitle2" color="error">
                                                    원본 문서
                                                </Typography>
                                            </Box>
                                            <Box sx={{ 
                                                p: 2, 
                                                fontFamily: 'monospace', 
                                                fontSize: '14px', 
                                                lineHeight: '1.5',
                                                minHeight: '500px'
                                            }}>
                                                {sideBySideData.map((lineData, index) => (
                                                    <Box
                                                        key={index}
                                                        sx={{
                                                            py: 0.5,
                                                            minHeight: '22px',
                                                            backgroundColor: lineData.leftLine?.hasChange ? 
                                                                theme.palette.error.main + '20' : 'transparent',
                                                            borderLeft: lineData.leftLine?.hasChange ? 
                                                                `4px solid ${theme.palette.error.main}` : 'none',
                                                            paddingLeft: lineData.leftLine?.hasChange ? '8px' : '12px',
                                                            display: 'flex',
                                                            alignItems: 'flex-start',
                                                            whiteSpace: 'pre-wrap',
                                                            wordBreak: 'break-word'
                                                        }}
                                                    >
                                                        <Typography 
                                                            variant="body2" 
                                                            component="span"
                                                            sx={{ 
                                                                fontFamily: 'monospace',
                                                                fontSize: '14px',
                                                                lineHeight: '1.5',
                                                                color: lineData.leftLine?.hasChange ? 'error.main' : 'text.primary'
                                                            }}
                                                        >
                                                            {lineData.leftLine?.content || ''}
                                                        </Typography>
                                                    </Box>
                                                ))}
                                            </Box>
                                        </Paper>

                                        {/* 비교 문서 (오른쪽) */}
                                        <Paper sx={{ flex: 1, bgcolor: 'grey.50' }}>
                                            <Box sx={{ p: 2, bgcolor: 'grey.200', borderBottom: 1, borderColor: 'divider' }}>
                                                <Typography variant="subtitle2" color="success.main">
                                                    비교 문서
                                                </Typography>
                                            </Box>
                                            <Box sx={{ 
                                                p: 2, 
                                                fontFamily: 'monospace', 
                                                fontSize: '14px', 
                                                lineHeight: '1.5',
                                                minHeight: '500px'
                                            }}>
                                                {sideBySideData.map((lineData, index) => (
                                                    <Box
                                                        key={index}
                                                        sx={{
                                                            py: 0.5,
                                                            minHeight: '22px',
                                                            backgroundColor: lineData.rightLine?.hasChange ? 
                                                                theme.palette.success.main + '20' : 'transparent',
                                                            borderLeft: lineData.rightLine?.hasChange ? 
                                                                `4px solid ${theme.palette.success.main}` : 'none',
                                                            paddingLeft: lineData.rightLine?.hasChange ? '8px' : '12px',
                                                            display: 'flex',
                                                            alignItems: 'flex-start',
                                                            whiteSpace: 'pre-wrap',
                                                            wordBreak: 'break-word'
                                                        }}
                                                    >
                                                        <Typography 
                                                            variant="body2" 
                                                            component="span"
                                                            sx={{ 
                                                                fontFamily: 'monospace',
                                                                fontSize: '14px',
                                                                lineHeight: '1.5',
                                                                color: lineData.rightLine?.hasChange ? 'success.main' : 'text.primary'
                                                            }}
                                                        >
                                                            {lineData.rightLine?.content || ''}
                                                        </Typography>
                                                    </Box>
                                                ))}
                                            </Box>
                                        </Paper>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Box>
                )}
            </Container>

            {/* 스낵바 */}
            <Snackbar 
                open={!!snackbarMessage} 
                autoHideDuration={6000} 
                onClose={() => setSnackbarMessage('')}
            >
                <Alert 
                    severity={snackbarSeverity} 
                    onClose={() => setSnackbarMessage('')}
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
} 