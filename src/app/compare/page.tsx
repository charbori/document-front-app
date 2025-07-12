"use client";

import {
    Compare as CompareIcon,
    ContentCopy as CopyIcon,
    Download as DownloadIcon,
    History as HistoryIcon,
    Login as LoginIcon,
    Logout as LogoutIcon,
    Person as PersonIcon,
    Refresh as RefreshIcon,
    Save as SaveIcon,
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
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    Menu,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Toolbar,
    Typography,
    useTheme
} from "@mui/material";
import Link from "next/link";
import { useCallback, useState } from "react";
import { api } from "../../services/api";
import { useComparePageContext } from "./compare-page-provider";


interface DocumentData {
    title: string;
    content: string;
}

interface DiffLine {
    type: 'added' | 'removed' | 'unchanged';
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

// 샘플 문서 데이터
const sampleDocuments = {
    original: {
        title: "원본 계약서",
        content: `제1조 (목적)
이 계약은 갑과 을 간의 소프트웨어 개발에 관한 권리와 의무를 규정함을 목적으로 한다.

제2조 (계약기간)
이 계약의 기간은 2024년 1월 1일부터 2024년 12월 31일까지로 한다.

제3조 (업무내용)
을은 다음 각 호의 업무를 수행한다.
1. 웹 애플리케이션 개발
2. 데이터베이스 설계
3. 시스템 테스트 및 배포

제4조 (대가)
갑은 을에게 매월 500만원을 지급한다.

제5조 (기타)
이 계약에 명시되지 않은 사항은 관련 법령에 따른다.`
    },
    modified: {
        title: "수정된 계약서",
        content: `제1조 (목적)
이 계약은 갑과 을 간의 AI 소프트웨어 개발에 관한 권리와 의무를 규정함을 목적으로 한다.

제2조 (계약기간)
이 계약의 기간은 2024년 1월 1일부터 2025년 6월 30일까지로 한다.

제3조 (업무내용)
을은 다음 각 호의 업무를 수행한다.
1. AI 웹 애플리케이션 개발
2. 데이터베이스 설계 및 최적화
3. 시스템 테스트, 배포 및 유지보수
4. 사용자 교육 및 기술지원

제4조 (대가)
갑은 을에게 매월 600만원을 지급한다.

제5조 (지적재산권)
개발된 소프트웨어의 지적재산권은 갑에게 귀속된다.

제6조 (기타)
이 계약에 명시되지 않은 사항은 관련 법령 및 상호 협의에 따른다.`
    }
};

export default function ComparePage() {
    const theme = useTheme();
    const { authData, logout } = useComparePageContext();
    
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
    const [showDiff, setShowDiff] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('side-by-side');

    const [openSaveDialog, setOpenSaveDialog] = useState(false);
    const [saveTitle, setSaveTitle] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

    // 사용자 메뉴 상태
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const isAuthenticated = authData.authenticated;
    const userIdentity = authData.userIdentity;

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

    // 향상된 diff 알고리즘
    const generateDiff = useCallback(() => {
        const leftLines = leftDoc.content.split('\n');
        const rightLines = rightDoc.content.split('\n');
        
        // 통합 뷰용 diff 결과
        const unifiedResult: DiffLine[] = [];
        
        // 사이드 바이 사이드용 diff 결과
        const sideByResult: SideBySideLineData[] = [];

        const maxLines = Math.max(leftLines.length, rightLines.length);
        
        for (let i = 0; i < maxLines; i++) {
            const leftLine = leftLines[i] || '';
            const rightLine = rightLines[i] || '';
            
            if (leftLine === rightLine) {
                if (leftLine.trim() !== '' || rightLine.trim() !== '') {
                    // 통합 뷰
                    unifiedResult.push({
                        type: 'unchanged',
                        content: leftLine,
                        lineNumber: i + 1
                    });
                    
                    // 사이드 바이 사이드
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
                // 통합 뷰
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
                
                // 사이드 바이 사이드
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
        setShowDiff(true);
    }, [leftDoc.content, rightDoc.content]);

    // 문서 교환
    const swapDocuments = () => {
        const temp = { ...leftDoc };
        setLeftDoc(rightDoc);
        setRightDoc(temp);
        setShowDiff(false);
    };

    // 문서 초기화
    const clearDocuments = () => {
        setLeftDoc({ title: "", content: "" });
        setRightDoc({ title: "", content: "" });
        setDiffResult([]);
        setSideBySideData([]);
        setShowDiff(false);
    };

    // 샘플 문서 로드
    const loadSampleDocuments = () => {
        setLeftDoc(sampleDocuments.original);
        setRightDoc(sampleDocuments.modified);
        setShowDiff(false);
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

    // 차이점 통계
    const getStats = () => {
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

    // 비교 결과 저장 (로그인된 사용자만)
    const handleSaveComparison = async () => {
        if (!isAuthenticated) {
            setSnackbarMessage('로그인된 사용자만 비교 결과를 저장할 수 있습니다.');
            setSnackbarSeverity('error');
            return;
        }

        if (!saveTitle.trim()) {
            setSnackbarMessage('제목을 입력해주세요.');
            setSnackbarSeverity('error');
            return;
        }

        if (!leftDoc.content.trim() || !rightDoc.content.trim()) {
            setSnackbarMessage('비교할 문서 내용을 입력해주세요.');
            setSnackbarSeverity('error');
            return;
        }

        setIsSaving(true);
        try {
            const compareRequest = {
                originalText: leftDoc.content,
                compareText: rightDoc.content,
                diffTitle: saveTitle.trim(),
                diffType: 'text' as const
            };

            const result = await api.compare.saveDiffResult(compareRequest);
            
            setSnackbarMessage('비교 결과가 성공적으로 저장되었습니다.');
            setSnackbarSeverity('success');
            setOpenSaveDialog(false);
            setSaveTitle('');
            
            console.log('저장된 비교 결과:', result);
        } catch (error: any) {
            console.error('비교 결과 저장 중 오류:', error);
            setSnackbarMessage(error.message || '비교 결과 저장에 실패했습니다.');
            setSnackbarSeverity('error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleOpenSaveDialog = () => {
        if (!isAuthenticated) {
            setSnackbarMessage('로그인된 사용자만 비교 결과를 저장할 수 있습니다.');
            setSnackbarSeverity('error');
            return;
        }

        // 기본 제목 설정
        const defaultTitle = `${leftDoc.title || '원본 문서'} vs ${rightDoc.title || '비교 문서'} - ${new Date().toLocaleDateString()}`;
        setSaveTitle(defaultTitle);
        setOpenSaveDialog(true);
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* 헤더 */}
            <AppBar position="static" color="default" elevation={1}>
                <Toolbar>
                    <CompareIcon sx={{ mr: 2 }} />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        문서 비교 도구
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
                        <IconButton 
                            color="inherit" 
                            onClick={clearDocuments}
                            title="모두 초기화"
                        >
                            <RefreshIcon />
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
                {!showDiff ? (
                    /* 편집 모드 */
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h4">문서 비교</Typography>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button 
                                    variant="outlined" 
                                    onClick={loadSampleDocuments}
                                    startIcon={<CopyIcon />}
                                >
                                    샘플 문서 로드
                                </Button>
                                <Button 
                                    variant="contained" 
                                    onClick={generateDiff}
                                    disabled={!leftDoc.content.trim() || !rightDoc.content.trim()}
                                    startIcon={<CompareIcon />}
                                >
                                    비교 시작
                                </Button>
                            </Box>
                        </Box>

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 2, height: '100%' }}>
                                    <Typography variant="h6" gutterBottom>
                                        원본 문서
                                    </Typography>
                                    <TextField
                                        placeholder="문서 제목을 입력하세요"
                                        value={leftDoc.title}
                                        onChange={(e) => setLeftDoc({...leftDoc, title: e.target.value})}
                                        fullWidth
                                        sx={{ mb: 2 }}
                                    />
                                    <TextField
                                        placeholder="원본 문서의 내용을 입력하세요..."
                                        value={leftDoc.content}
                                        onChange={(e) => setLeftDoc({...leftDoc, content: e.target.value})}
                                        fullWidth
                                        multiline
                                        rows={20}
                                        sx={{ 
                                            fontFamily: 'monospace',
                                            '& .MuiOutlinedInput-root': {
                                                fontFamily: 'monospace',
                                                fontSize: '14px',
                                                lineHeight: '1.5',
                                            }
                                        }}
                                    />
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 2, height: '100%' }}>
                                    <Typography variant="h6" gutterBottom>
                                        비교 문서
                                    </Typography>
                                    <TextField
                                        placeholder="문서 제목을 입력하세요"
                                        value={rightDoc.title}
                                        onChange={(e) => setRightDoc({...rightDoc, title: e.target.value})}
                                        fullWidth
                                        sx={{ mb: 2 }}
                                    />
                                    <TextField
                                        placeholder="비교할 문서의 내용을 입력하세요..."
                                        value={rightDoc.content}
                                        onChange={(e) => setRightDoc({...rightDoc, content: e.target.value})}
                                        fullWidth
                                        multiline
                                        rows={20}
                                        sx={{ 
                                            fontFamily: 'monospace',
                                            '& .MuiOutlinedInput-root': {
                                                fontFamily: 'monospace',
                                                fontSize: '14px',
                                                lineHeight: '1.5',
                                            }
                                        }}
                                    />
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                ) : (
                    /* 비교 결과 표시 */
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                            <Typography variant="h5">비교 결과</Typography>
                            
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
                                
                                {/* 저장 버튼 (로그인된 사용자만) */}
                                {isAuthenticated && (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleOpenSaveDialog}
                                        startIcon={<SaveIcon />}
                                    >
                                        저장
                                    </Button>
                                )}
                                
                                <Button 
                                    variant="outlined" 
                                    onClick={() => setShowDiff(false)}
                                >
                                    편집 모드로 돌아가기
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
                                </Box>
                            </CardContent>
                        </Card>

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
                                    <Box sx={{ display: 'flex', gap: 2, maxHeight: '600px' }}>
                                        {/* 원본 문서 (왼쪽) */}
                                        <Paper 
                                            sx={{ 
                                                flex: 1,
                                                p: 0,
                                                overflow: 'auto',
                                                border: 1,
                                                borderColor: 'divider'
                                            }}
                                        >
                                            <Box sx={{ 
                                                p: 2, 
                                                bgcolor: 'error.light', 
                                                borderBottom: 1, 
                                                borderColor: 'divider' 
                                            }}>
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                    원본 문서: {leftDoc.title || '(제목 없음)'}
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
                                        <Paper 
                                            sx={{ 
                                                flex: 1,
                                                p: 0,
                                                overflow: 'auto',
                                                border: 1,
                                                borderColor: 'divider'
                                            }}
                                        >
                                            <Box sx={{ 
                                                p: 2, 
                                                bgcolor: 'success.light', 
                                                borderBottom: 1, 
                                                borderColor: 'divider' 
                                            }}>
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                    비교 문서: {rightDoc.title || '(제목 없음)'}
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

            {/* 저장 다이얼로그 */}
            <Dialog open={openSaveDialog} onClose={() => setOpenSaveDialog(false)}>
                <DialogTitle>비교 결과 저장</DialogTitle>
                <DialogContent>
                    <TextField
                        label="저장할 비교 결과 제목"
                        value={saveTitle}
                        onChange={(e) => setSaveTitle(e.target.value)}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        sx={{ mb: 2 }}
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="view-mode-label">뷰 모드</InputLabel>
                        <Select
                            labelId="view-mode-label"
                            value={viewMode}
                            label="뷰 모드"
                            onChange={(e) => setViewMode(e.target.value as ViewMode)}
                        >
                            <MenuItem value="side-by-side">사이드 바이 사이드</MenuItem>
                            <MenuItem value="unified">통합 뷰</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenSaveDialog(false)}>취소</Button>
                    <Button variant="contained" onClick={handleSaveComparison} disabled={isSaving}>
                        {isSaving ? '저장 중...' : '저장'}
                    </Button>
                </DialogActions>
            </Dialog>

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