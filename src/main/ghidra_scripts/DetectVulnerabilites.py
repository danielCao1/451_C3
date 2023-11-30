known_vulnerable = ["strcpy", "_strcpy", "strcpyA", "strcpyw", "wcscpy", "_wcscpy", "_tcscpy", "mbscpy",
"_mbscpy", "StrCpy", "StrCpyA", "StrCpyW", "lstrcpy", "lstrcpyA", "lstrcpyW", "_tccpy", "_mbccpy", "_ftcscpy",
"stpcpy", "wcpcpy", "strcat", "_strcat", "strcatA", "strcatW", "wcscat", "_wcscat", "_tcscat", "mbscat",
"_mbscat", "StrCat", "StrCatA", "StrCatW", "lstrcat", "_lstrcat", "lstrcatA", "_lstrcatA", "lstrcatW",
"_lstrcatW", "StrCatBuff", "StrCatBuffA", "StrCatBuffW", "StrCatChainW", "_tccat", "_mbccat", "_ftcscat",
"sprintf", "_sprintf", "_sprintf_c89", "vsprintf", "_vsprintf", "_vsprintf_c89", "_wsprintfA", "_wsprintfW",
"sprintfW", "sprintfA", "wsprintf", "_wsprintf", "wsprintfW", "_wsprintfW", "wsprintfA", "_wsprintfA",
"_stprintf", "wvsprintf", "wvsprintfA", "wvsprintfW", "_vstprintf", "scanf", "_scanf", " isoc99_sscanf",
"wscanf", "_tscanf", "sscanf", "_sscanf", "_sscanf_c89", "fscanf", "_fscanf", "_isoc99_fscanf", "vfscanf",
"_vfscanf", "fwscanf", "swscanf", "_stscanf", "snscanf", "_snscanf", "snwscanf", "_snwscanf", "_sntscanf",
"vsscanf", "_vsscanf", "vscanf", "_vscanf", "vfwscanf", "_vfwscanf", "vswscanf", "_vswscanf", "vwscanf",
" vwscanf","gets", "_gets", "_getts", "_getws", "_gettws", "getpw", "getpass", "getc", "getchar", "alloca",
"_alloca","system", "_system", "popen", "_popen", "wpopen", "_wpopen", "mktemp", "tmpnam", "tempnam", "rand",
"rand_r", "srand","strncpy", "_strncpy", "wcsncpy", "_tcsncpy", "_mbsncpy", "_mbsnbcpy", "StrCpyN",
"StrCpyNA", "StrCpyNW", "StrNCpy", "strcpynA", "StrNCpyA", "StrNCpyW", "lstrcpyn", "lstrcpynA", "lstrcpynw",
"_csncpy", "wcscpyn", "stpncpy", "wcpncpy", "strncat", "_strncat", "wcsncat", "_tcsncat", "_mbsncat",
"_mbsnbcat", "StrCatN", "StrCatNA", "StrCatNW", "StrNCat", "StrNCatA", "StrNCatW", "lstrncat", "lstrcatnA",
"lstrcatnW", "lstrcatn", "strlcpy", "wcslcpy", "strlcat", "wcslcat", "strlen", "lstrlen", "strnlen", "wcslen",
"wcsnlen", "strtok", "_tcstok", "wcstok", "_mbstok", "snprintf", "_sntprintf", "_snprintf", "_snprintf_c89",
"_snwprintf", "vsnprintf", "_vsnprintf", "_vsnprintf_c89", "vsnwprintf", "_vsnwprintf", "wnsprintf",
"wnsprintfA", "wnsprintfW", "_vsntprintf", "wvnsprintf", "wvnsprintfA", "wvnsprintfW", "swprintf",
"_swprintf", "vswprintf", "_vswprintf", "memcpy", "_memcpy", "memccpy", "memmove", "_memmove", "bcopy",
"memset", "wmemcpy", "_wmemcpy", "wmemmove", "_wmemmove", "RtlCopyMemory", "CopyMemory", "setuid", "seteuid",
"setreuid", "setresuid", "setgid", "setegid", "setregid", "setresgid", "setgroups", "initgroups", "execl",
"execlp", "execle", "execv", "execve", "execvp", "execvpe", "_execl", "_execlp", "_execle", "_execv",
"_execve", "_execvp", "_execvpe", "fork", "vfork", "clone", "pipe", "open", "open64"]

def get_functions():
    func_manager = currentProgram.getFunctionManager()
    all_functions = func_manager.getFunctionsNoStubs(True)
    vulnerabilities = []
    for func in all_functions:
        vuln_info = vuln_check(func)
        if vuln_info:
            vulnerabilities.extend(vuln_info)
    return vulnerabilities

def vuln_check(func):
    if func.getName() in known_vulnerable:
        callers = get_callers(func)
        if not callers:
            return None
        else:
            return [{"caller": str(caller), "vulnerable_function": func.getName()} for caller in callers]

def get_callers(func):
    callers = func.getCallingFunctions(None)
    return callers

vulnerabilities = get_functions()
for vuln in vulnerabilities:
    print(vuln)
