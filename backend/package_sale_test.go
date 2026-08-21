package main

import (
	"testing"
	"time"
)

func TestPackageUnavailableReason(t *testing.T) {
	now := time.Date(2026, time.August, 21, 12, 0, 0, 0, time.UTC)
	start := now.Add(time.Hour)
	end := now.Add(-time.Hour)
	tests := []struct {
		name   string
		active bool
		stock  int
		start  *time.Time
		end    *time.Time
		want   string
	}{
		{name: "available", active: true, stock: -1},
		{name: "off shelf", active: false, stock: -1, want: "套餐已下架"},
		{name: "sold out", active: true, stock: 0, want: "套餐已售罄"},
		{name: "not started", active: true, stock: 1, start: &start, want: "套餐暂未开售"},
		{name: "ended", active: true, stock: 1, end: &end, want: "套餐已结束售卖"},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if got := packageUnavailableReason(test.active, test.stock, test.start, test.end, now); got != test.want {
				t.Fatalf("packageUnavailableReason() = %q, want %q", got, test.want)
			}
		})
	}
}
