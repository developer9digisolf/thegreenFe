import { useState, useEffect } from "react";
import { Briefcase, ChevronDown, Check } from "react-feather";
import {
    DropdownToggle,
    Dropdown,
    Spinner,
} from "@doar/components";
import { 
    GetCompaniesService 
} from "@afx/services/master/companies.service";
import { 
    AuthSwitchCompanyService, 
    AuthHelper 
} from "@afx/services/auth.service";
import { useAuthStore } from "@afx/stores/auth.store";
import { IResCompany } from "@afx/interfaces/master/company.iface";
import {
    StyledDropMenu,
    StyledDropItem,
    StyledHeader,
    StyledDivider,
    StyledCompanyInfo,
    StyledCompanyName,
    StyledCompanyRole,
    StyledEmpty,
} from "./style";

const CompanySwitcher = () => {
    const { user, setAuth } = useAuthStore();
    const [companies, setCompanies] = useState<IResCompany[]>([]);
    const [loading, setLoading] = useState(false);
    const [switching, setSwitching] = useState<number | null>(null);

    // Get current company from user or storage
    const currentCompanyId = (user as any)?.companyId;
    const currentCompany = companies.find(c => c.id === currentCompanyId) || companies[0];

    useEffect(() => {
        const fetchCompanies = async () => {
            setLoading(true);
            try {
                const response = await GetCompaniesService({ page: 1, limit: 100 } as any);
                if (response?.data) {
                    setCompanies(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch companies:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCompanies();
    }, []);

    const handleSwitch = async (companyId: number) => {
        if (companyId === currentCompanyId) return;
        
        setSwitching(companyId);
        try {
            const response = await AuthSwitchCompanyService(companyId);
            if (response?.data) {
                // Save to storage
                AuthHelper.saveAuth(response.data);
                
                // Update Zustand store
                setAuth(response.data.user, response.data.accessToken);
                
                // Refresh the page to reload all data with new company context
                window.location.reload();
            }
        } catch (error) {
            console.error("Failed to switch company:", error);
        } finally {
            setSwitching(null);
        }
    };

    return (
        <Dropdown direction="down" className="dropdown-company">
            <DropdownToggle variant="texted">
                <StyledHeader>
                    <Briefcase size={18} className="header-icon" />
                    <span className="company-name">
                        {currentCompany?.name || "Select Company"}
                    </span>
                    <ChevronDown size={14} className="chevron" />
                </StyledHeader>
            </DropdownToggle>
            <StyledDropMenu>
                <StyledCompanyInfo>
                    <StyledCompanyName>Switch Company</StyledCompanyName>
                    <StyledCompanyRole>Select a workspace to switch to</StyledCompanyRole>
                </StyledCompanyInfo>
                <StyledDivider />
                {loading ? (
                    <StyledEmpty>
                        <Spinner size="sm" color="primary" />
                    </StyledEmpty>
                ) : companies.length > 0 ? (
                    companies.map((company) => (
                        <StyledDropItem 
                            key={company.id} 
                            onClick={() => handleSwitch(company.id)}
                            $active={company.id === currentCompanyId}
                        >
                            <div className="item-content">
                                <Briefcase size="18" />
                                <span>{company.name}</span>
                            </div>
                            {company.id === currentCompanyId && <Check size="16" className="active-icon" />}
                            {switching === company.id && <Spinner size="xs" color="primary" />}
                        </StyledDropItem>
                    ))
                ) : (
                    <StyledEmpty>No companies available</StyledEmpty>
                )}
            </StyledDropMenu>
        </Dropdown>
    );
};

export default CompanySwitcher;
