{{/*
Expand the name of the chart.
*/}}
{{- define "kong.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "kong.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "kong.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "kong.labels" -}}
helm.sh/chart: {{ include "kong.chart" . }}
{{ include "kong.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "kong.selectorLabels" -}}
app.kubernetes.io/name: {{ include "kong.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "kong.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "kong.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create auth service name
*/}}
{{- define "kong.auth.fullname" -}}
{{- printf "%s-auth" .Release.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create rest service name
*/}}
{{- define "kong.rest.fullname" -}}
{{- printf "%s-rest" .Release.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create realtime service name
*/}}
{{- define "kong.realtime.fullname" -}}
{{- printf "%s-realtime" .Release.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create storage service name
*/}}
{{- define "kong.storage.fullname" -}}
{{- printf "%s-storage" .Release.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create functions service name
*/}}
{{- define "kong.functions.fullname" -}}
{{- printf "%s-functions" .Release.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create analytics service name
*/}}
{{- define "kong.analytics.fullname" -}}
{{- printf "%s-analytics" .Release.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create meta service name
*/}}
{{- define "kong.meta.fullname" -}}
{{- printf "%s-meta" .Release.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create studio service name
*/}}
{{- define "kong.studio.fullname" -}}
{{- printf "%s-studio" .Release.Name | trunc 63 | trimSuffix "-" }}
{{- end }}
