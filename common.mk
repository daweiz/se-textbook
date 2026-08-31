unix_path = $(subst \,/,$(1))
PANDOCX := $(call unix_path,$(PANDOCX_HOME))
CURRENT := $(CURDIR)
PARENT := $(abspath $(CURRENT)/..)
TARGET := build

ifeq ($(OS),Windows_NT)
	INITDIR = ( \
        if not exist "$(TARGET)" ( \
            mkdir "$(TARGET)" \
        ) else ( \
            del /q /s "$(TARGET)\*" >nul 2>&1 && \
            for /d %%d in ("$(TARGET)\*") do rmdir /s /q "%%d" \
        ) \
	)
else
    INITDIR = ( \
        if [ ! -d "$(TARGET)" ]; then \
            mkdir -p "$(TARGET)"; \
        else \
            rm -rf "$(TARGET)"/*; \
        fi \
    )
endif
