namespace Pep.Model.Models;

public class StaffMemberAccess
{
    public int StaffId { get; set; }
    public string StaffName { get; set; } = string.Empty;
    public bool IsAdministrator { get; set; }
}
